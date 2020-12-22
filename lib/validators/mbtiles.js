var fs = require('fs');
var tiletype = require('@mapbox/tiletype');
var uploadLimits = require('mapbox-upload-limits');
var invalid = require('../invalid');
var queue = require('queue-async');
var prettyBytes = require('pretty-bytes');
var log = require('fastlog')('mapbox-upload-validate', process.env.FASTLOG_LEVEL || 'info');

module.exports = function validateMbtiles(opts, callback) {
  var limits = opts.limits || uploadLimits.mbtiles;

  if (opts.info.formatter)
    return callback(invalid('Use TileMill 0.7 or later to export MBTiles with a valid template.'));

  // when using queue-async, functions can return an object w/
  // an abort fn. to prevent errors, functions used with queue-async
  // should not return an object unless it has an abort() definition
  queue(1 /* sequential execution */)
    .defer(validFormat, opts.source._db, opts.info)
    .defer(deprecatedCarmen, opts.source._db)
    .defer(fileSize, opts.filepath, limits)
    .defer(dataCounts, opts.source._db, limits)
    .defer(zoomCheck, opts.source._db, limits)
    .await(callback);
};

function sqliteError(err) {
  // Ignore these situations
  if (!err) return false;
  if (err && err.code === 'SQLITE_ERROR' && err.message.indexOf('no such table') >= 0) return false;

  // Known situations that should mark an mbtiles as invalid
  if (err && err.code === 'SQLITE_CORRUPT') err = invalid(err);
  if (err && err.code === 'EINVALIDTILE') err = invalid(err);
  if (err && err.code === 'SQLITE_ERROR' && err.message.indexOf('no such column')) err = invalid(err);

  // If an error is returned that was not marked invalid, validation will fail
  return err;
}

function validFormat(db, info, callback) {
  log.debug('validFormat(): checking...');
  db.get('SELECT tile_data FROM tiles LIMIT 1', function(err, result) {
    err = sqliteError(err);
    if (err) return callback(err);

    if (!result) {
      log.debug('validFormat(): valid! (no tiles)');
      return callback(); // no-op for no tiles
    }
    if (!result.tile_data) return callback(invalid('Tile is invalid'));

    var format = tiletype.type(result.tile_data);
    if (!format) return callback(invalid('Unknown format.'));

    if (format === 'pbf' && !info.hasOwnProperty('vector_layers'))
      return callback(invalid('Vector source must include "vector_layers" key'));

    log.debug('validFormat(): valid!');
    callback();
  });
}

function deprecatedCarmen(db, callback) {
  log.debug('deprecatedCarmen(): checking...');
  db.get('SELECT COUNT(1) AS count FROM carmen', function(err, result) {
    err = sqliteError(err);
    if (err) return callback(err);

    if (result && result.count)
      return callback(invalid('Carmen 0.1.x tilesets are no longer supported.'));

    log.debug('deprecatedCarmen(): valid!');
    callback();
  });
}

function zoomCheck(db, limits, callback) {
  function getMaxZoom(type, cb) {
    var query =
      type === 'tiles_max' ? 'SELECT MAX(zoom_level) as z FROM tiles' :
      type === 'grids_max' ? 'SELECT MAX(zoom_level) as z FROM grids' :
      type === 'tiles_min' ? 'SELECT MIN(zoom_level) as z FROM tiles' :
      type === 'maxzoom' ? 'SELECT (value) FROM metadata WHERE name=\'maxzoom\'' :
      type === 'fillzoom' ? 'SELECT (value) FROM metadata WHERE name=\'fillzoom\'' :
      null;
    db.get(query, function(err, result) {
      result = result || {};
      err = sqliteError(err);
      if (err) return cb(err);

      log.debug('zoomCheck::getMaxZoom(): ' + type + ' finished: ' + JSON.stringify(result));
      cb(null, {
        z: result.z || 0
      });
    });
  }
  
  log.debug('zoomCheck(): checking...');
  queue()
    .defer(getMaxZoom, 'tiles_max')
    .defer(getMaxZoom, 'grids_max')
    .defer(getMaxZoom, 'tiles_min')
    .defer(getMaxZoom, 'maxzoom')
    .defer(getMaxZoom, 'fillzoom')
    .awaitAll(function(err, zoom) {
      err = sqliteError(err);
      if (err) return callback(err);

      let [tiles_max, grids_max, tiles_min, maxzoom, fillzoom] = zoom;

      if (tiles_max.z > limits.max_zoomlevel)
        return callback(invalid('Maxzoom exceeded for mbtiles file. There is a max zoom limit of ' + limits.max_zoomlevel + ' but tiles up to zoom level ' + tiles_max.z + ' were found. If you need support for 1cm tilesets please reach out to support.'));
      if (grids_max.z > limits.max_zoomlevel)
        return callback(invalid('Maxzoom exceeded for mbtiles file. There is a max zoom limit of ' + limits.max_zoomlevel + ' but tiles up to zoom level ' + grids_max.z + ' were found. If you need support for 1cm tilesets please reach out to support.'));
      if (tiles_min.z < 0)
        return callback(invalid('Minzoom exceeded for mbtiles file. There is a min zoom limit of 0 but tiles down to zoom level ' + tiles_min.z + ' were found.'));

      if ('value' in fillzoom) {
        if (!fillzoom.value.match('^[0-9]+$')) {
          return callback(invalid('Fillzoom in mbtiles metadata is not numeric. Found: ' + fillzoom.value));
        }
        let fz = Number.parseInt(fillzoom.value, 10);
        if (fz < tiles_min.z) {
          return callback(invalid('Fillzoom in mbtiles metadata (' + fz + ') is lower than actual minzoom (' + tiles_min.z + ')'));
        }
        if (fz > tiles_max.z) {
          return callback(invalid('Fillzoom in mbtiles metadata (' + fz + ') is higher than actual maxzoom (' + tiles_max.z + ')'));
        }
      }

      if ('value' in maxzoom) {
        if (!maxzoom.value.match('^[0-9]+$')) {
          return callback(invalid('Maxzoom in mbtiles metadata is not numeric. Found: ' + maxzoom.value));
        }
        let mz = Number.parseInt(maxzoom.value, 10);
        if (mz < tiles_min.z) {
          return callback(invalid('Maxzoom in mbtiles metadata (' + mz + ') is lower than actual minzoom (' + tiles_min.z + ')'));
        }
        if (mz < tiles_max.z) {
          return callback(invalid('Maxzoom in mbtiles metadata (' + mz + ') is lower than actual maxzoom (' + tiles_max.z + ')'));
        }
        if (mz > tiles_max.z) {
          if ('value' in fillzoom) {
            // Out-of range maxzoom is OK and expected in some raster uploads,
            // if fillzoom also exists and was therefore validated to be in range above.
          } else {
            return callback(invalid('Maxzoom in mbtiles metadata (' + mz + ') is higher than actual maxzoom (' + tiles_max.z + ')'));
          }
        }
      }

      log.debug('zoomCheck(): OK.');
      callback();
    });

}

function dataCounts(db, limits, callback) {
  function count(type, cb) {
    var query = type === 'tiles' ?
      'SELECT COUNT(1) AS count, MAX(LENGTH(tile_data)) AS size, zoom_level as z FROM tiles' :
      'SELECT COUNT(1) AS count, MAX(LENGTH(grid)) AS size, zoom_level as z FROM grids';
    db.get(query, function(err, result) {
      result = result || {};
      err = sqliteError(err);
      if (err) return cb(err);

      log.debug('dataCounts::count(): ' + type + ' finished: ' + JSON.stringify(result));
      cb(null, {
        count: result.count || 0,
        size: result.size || 0,
        z: result.z
      });
    });
  }

  log.debug('dataCounts(): checking...');
  queue()
    .defer(count, 'tiles')
    .defer(count, 'grids')
    .awaitAll(function(err, counts) {
      err = sqliteError(err);
      if (err) return callback(err);

      var total = counts[0].count + counts[1].count;
      if (total === 0) return callback(invalid('Tileset is empty.'));
      if (total > limits.max_totalitems) return callback(invalid('Tileset exceeds processing limit.'));

      if (counts[0].size > limits.max_tilesize)
        return callback(invalid('Tile exceeds maximum size of ' + Math.round(limits.max_tilesize / 1024) + 'k at z' + counts[0].z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));
      if (counts[1].size > limits.max_gridsize)
        return callback(invalid('Grid exceeds maximum size of ' + Math.round(limits.max_gridsize / 1024) + 'k at z' + counts[1].z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));

      log.debug('dataCounts(): OK.');
      callback();
    });
}

function fileSize(filepath, limits, callback) {
  log.debug('fileSize(): checking...');
  fs.stat(filepath, function(err, stat) {
    if (err) return callback(err);

    if (stat.size > limits.max_filesize) {
      return callback(invalid('File is larger than ' + prettyBytes(limits.max_filesize) + '. Too big to process.'));
    }
    log.debug('fileSize(): OK.');
    callback();
  });
}
