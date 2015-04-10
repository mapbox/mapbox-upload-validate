var tilelive = require('tilelive');
var fs = require('fs');
var zlib = require('zlib');
var invalid = require('../invalid');
var mapnik = require('mapnik');
var tiletype = require('tiletype');
var stream = require('stream');

// The only additional validation performed on serialtiles is based on the size
// of any individual tile, which means deserializing the whole set and checking
// every tile's size.
// This might make sense in some contexts, and in others you might just skip this
// step and let it come out during a tilelive-copy operation

module.exports = function validateSerialtiles(opts, callback) {
  if (process.env.SkipSerialtilesValidation) return callback();
  var limits = opts.limits || { max_tilesize: 1024 * 500 };
  var errored = false;

  var writable = new stream.Writable({ objectMode: true });
  writable._write = function(tile, enc, cb) {
    if (errored) return cb();
    if (!tile.buffer) return cb();

    var format = tiletype.type(tile.buffer);

    if (!format) {
      cb(invalid('Invalid tiletype'));
      errored = true;
      return read.close();
    }

    if (tile.buffer.length > limits.max_tilesize) {
      cb(invalid('Tile exceeds maximum size of ' + Math.round(limits.max_tilesize/1024) + 'k at z' + tile.z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));
      errored = true;
      return read.close();
    }

    if (format !== 'pbf') return cb();

    var vtile = new mapnik.VectorTile(tile.z, tile.x, tile.y);

    zlib.gunzip(tile.buffer, function(err, data) {
      if (err) return cb(invalid(err.message));

      vtile.setData(data, function(err) {
        if (err) return cb(invalid(err.message));

        try { vtile.parse(); }
        catch (err) {
          err.name = 'DeserializationError';
          err.message = 'Invalid data';
          return cb(err);
        }

        if (vtile.empty()) return cb(invalid('Tile is empty'));

        var json = vtile.toJSON();
        if (!json[0] || !json[0].name) return cb(invalid('Tile has no layers'));
        if (!json[0] || !json[0].features) return cb(invalid('Tile has no features'));

        return cb();
      });
    });
  };

  function fail(err) {
    if (!errored) {
      if (err.name === 'DeserializationError') return callback(invalid('%s: %s', err.name, err.message));
      else return callback(err);
    }
    errored = true;
  }

  var read = fs.createReadStream(opts.filepath);
  read.pipe(zlib.createGunzip())
    .pipe(tilelive.deserialize())
    .once('error', fail)
    .pipe(writable)
    .once('error', fail)
    .on('finish', function() {
      if (!errored) return callback();
    });
};
