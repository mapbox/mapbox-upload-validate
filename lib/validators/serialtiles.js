var tilelive = require('tilelive');
var fs = require('fs');
var zlib = require('zlib');
var invalid = require('../invalid');
var mapnik = require('mapnik');
var tiletype = require('tiletype');

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

      var gzipped = (tiletype.headers(t.buffer))['Content-Encoding'] === 'gzip';
      var format = tiletype.type(t.buffer);

      // Not gzipped and not a valid tiletype
      if (!gzipped && (format !== 'png' && format !== 'webp' && format !== 'jpg')) {
        callback(invalid('Invalid tiletype'));
        errored = true;
        read.close();
      }
      
      // Gzipped pbf
      if (gzipped) {
        //gunzip buffer and validate
        validateGzipped(t, function(err) {
          if (err) {
            callback(invalid('Invalid pbf: %s', err.message));
            errored = true;
            read.close();
          }
          if (t.buffer.length <= limits.max_tilesize) return;
          else callback(invalid('Tile exceeds maximum size of ' + Math.round(limits.max_tilesize/1024) + 'k at z' + t.z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));
          errored = true;
          read.close();
        });
        //else validate maxsize of png/webp/jpg
      } else {
        if (t.buffer.length <= limits.max_tilesize) return;
        else callback(invalid('Tile exceeds maximum size of ' + Math.round(limits.max_tilesize/1024) + 'k at z' + t.z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));
        errored = true;
        read.close();
      }
    })
    .once('error', function(err) {
      if (!errored) {
        if (err.name === 'DeserializationError') return callback(invalid('%s: %s', err.name, err.message));
        else return callback(err);
      }
      errored = true;
    })
    .on('end', function() {
      if (!errored) return callback();
    })
    .resume();

  function validateGzipped(tile, callback) {
    var vtile;
    try {
      vtile = new mapnik.VectorTile(tile.z,tile.x,tile.y);
    } catch (err) { 
      return callback(err); 
    }

    zlib.gunzip(tile.buffer, function(err, data) { 
      if (err) return callback(invalid(err.message));

      vtile.setData(data, function(err) {
        if (err) return callback(invalid(err.message));
        
        vtile.parse();
        if (vtile.empty()) return callback(invalid('Tile is empty'));
        
        var json = vtile.toJSON();
        if (!json[0] || !json[0].name) return callback(invalid('Tile has no layers'));
        if (!json[0] || !json[0].features) return callback(invalid('Tile has no features'));

        return callback(null);

      });
    });
  }
};