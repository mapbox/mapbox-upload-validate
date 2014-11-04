var tiletype = require('tiletype');
var invalid = require('../invalid');

module.exports = function validateMbtiles(opts, callback) {
  var limits = opts.limits || {
    max_geocodershard: 1024 * 1024,
    max_totalitems: 30e6,
    max_tilesize: 500 * 1024,
    max_gridsize: 500 * 1024
  };

  if (opts.info.formatter)
    return callback(invalid('Use TileMill 0.7 or later to export MBTiles with a valid template.'));

  queue()
    .defer(validFormat, opts.source._db, opts.info)
    .defer(deprecatedCarmen, opts.source._db)
    .defer(geocoderShardSize, opts.source._db, limits)
    .defer(dataCounts, opts.source._db, limits)
    .await(callback);
};

function sqliteError(err) {
  // Ignore these situations
  if (!err) return false;
  if (err && err.code === 'SQLITE_ERROR' && err.message.indexOf('no such table') >= 0) return false;

  // Known situations that should mark an mbtiles as invalid
  if (err && err.code === 'SQLITE_CORRUPT') err = invalid(err);

  // If an error is returned that was not marked invalid, validation will fail
  return err;
}

function validFormat(db, info, callback) {
  db.get('SELECT tile_data FROM tiles LIMIT 1', function(err, result) {
    err = sqliteError(err);
    if (err) return callback(err);

    if (!result) return callback(); // no-op for no tiles

    var format = tiletype.type(result.tile_data);
    if (!format) return callback(invalid('Unknown format.'));

    if (format === 'pbf' && !info.hasOwnProperty('vector_layers'))
      return callback(invalid('Vector source must include "vector_layers" key'));

    callback();
  });
}

function deprecatedCarmen(db, callback) {
  db.get('SELECT COUNT(1) AS count FROM carmen', function(err, result) {
    err = sqliteError(err);
    if (err) return callback(err);

    if (result && result.count)
      return callback(invalid('Carmen 0.1.x tilesets are no longer supported.'));

    callback();
  });
}

function geocoderShardSize(db, limits, callback) {
  db.get('SELECT MAX(LENGTH(data)) AS max FROM geocoder_data', function(err, result) {
    err = sqliteError(err);
    if (err) return callback(err);

    if (result && result.max && result.max > limits.max_geocodershard)
      return callback(invalid('Geocoder index shards exceed limit of %sk.', (limits.max_geocodershard/1024).toFixed(1)));

    callback();
  });
}

function dataCounts(db, limits, callback) {
  queue()
    .defer(db.get.bind(db), 'SELECT COUNT(1) AS count, MAX(LENGTH(tile_data)) AS size, zoom_level as z FROM tiles')
    .defer(db.get.bind(db), 'SELECT COUNT(1) AS count, MAX(LENGTH(grid)) AS size, zoom_level as z FROM grids')
    .awaitAll(function(err, counts) {
      err = sqliteError(err);
      if (err) return callback(err);

      var total = (counts[0].count || 0) + (counts[1].count || 0);
      if (total === 0) return callback(invalid('Tileset is empty.'));
      if (total > limits.max_totalitems) return callback(invalid('Tileset exceeds processing limit.'));

      if (counts[0].size > limits.max_tilesize)
        return callback(invalid('Tile exceeds maximum size of ' + Math.round(limits.max_tilesize/1024) + 'k at z' + counts[0].z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));
      if (counts[1].size > limits.max_gridsize)
        return callback(invalid('Grid exceeds maximum size of ' + Math.round(limits.max_gridsize/1024) + 'k at z' + counts[1].z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));

      callback();
    });
}
