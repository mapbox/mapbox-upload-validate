var tilelive = require('tilelive');
var fs = require('fs');
var zlib = require('zlib');
var invalid = require('../invalid');
var tiletype = require('tiletype');

// The only additional validation performed on serialtiles is verifying tiletype, that the buffer is gzipped, and verifying the size
// of any individual tile, which means deserializing the whole set and checking
// every tile's size.
// This might make sense in some contexts, and in others you might just skip this
// step and let it come out during a tilelive-copy operation

module.exports = function validateSerialtiles(opts, callback) {
  if (process.env.SkipSerialtilesValidation) return callback();

  var limits = opts.limits || { max_tilesize: 1024 * 500 };
  var errored = false;

  var read = fs.createReadStream(opts.filepath);
  read.pipe(zlib.createGunzip())
    .pipe(tilelive.deserialize())
    .on('tile', function(t) {
      if (errored) return;
      if (!t.buffer) return;
      
      var gzipped = (tiletype.headers(t.buffer))['Content-Encoding'] === 'gzip';
      if (!gzipped) callback(invalid('Invalid tile (x' + t.x + ' y' + t.y + ' z' + t.z + '). Buffer must be gzipped'));

      var format = tiletype.type(t.buffer);
      if (!format) callback(invalid('Tile (x' + t.x + ' y' + t.y + ' z' + t.z + ') is not a valid tiletype'));

      if (t.buffer.length <= limits.max_tilesize) return;
      callback(invalid('Tile exceeds maximum size of ' + Math.round(limits.max_tilesize/1024) + 'k at z' + t.z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));
      errored = true;
      read.close();
    })
    .on('error', function(err) {
      if (!errored) callback(err);
      errored = true;
    })
    .on('end', function() {
      if (!errored) callback();
    })
    .resume();
};
