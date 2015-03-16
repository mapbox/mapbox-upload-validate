var tilelive = require('tilelive');
var fs = require('fs');
var zlib = require('zlib');
var invalid = require('../invalid');

// The only additional validation performed on serialtiles is based on the size
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

      // Validate tiletype
      var gzipped = (tiletype.headers(t.buffer))['Content-Encoding'] === 'gzip';
      var format = tiletype.type(t.buffer);

      // Not gzipped and not a valid tiletype
      if (!gzipped && (format !== 'png' && format !== 'webp' && format !== 'jpg')) callback(invalid('Invalid tiletype'));
      
      if (format === 'pbf') {
        //gunzip buffer

        //parse buffer using mapnik or vector-tile-js

        //confirm has layers/features
      } 

      if (t.buffer.length <= limits.max_tilesize) return;
      callback(invalid('Tile exceeds maximum size of ' + Math.round(limits.max_tilesize/1024) + 'k at z' + t.z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));
      errored = true;
      read.close();
    })
    .once('error', function(err) {
      if (!errored) {
        if (err.name === 'DeserializationError') callback(invalid('%s: %s', err.name, err.message));
        else callback(err);
      }
      errored = true;
    })
    .on('end', function() {
      if (!errored) callback();
    })
    .resume();
};
