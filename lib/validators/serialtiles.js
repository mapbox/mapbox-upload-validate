var tilelive = require('tilelive');
var uploadLimits = require('mapbox-upload-limits');
var fs = require('fs');
var zlib = require('zlib');
var util = require('./util');
var invalid = require('../invalid');
var mapnik = require('mapnik');
var tiletype = require('tiletype');
var stream = require('stream');
var prettyBytes = require('pretty-bytes');

module.exports = validateSerialtiles;
module.exports.validType = validType;
module.exports.validLength = validLength;
module.exports.validVectoTile = validVectorTile;
module.exports.ValidationStream = ValidationStream;

function validateSerialtiles(opts, callback) {
  if (process.env.SkipSerialtilesValidation) return callback();
  var limits = opts.limits || uploadLimits.serialtiles;

  var validationStream = ValidationStream({
    sizeLimit: limits.max_tilesize,
    validateVectorTiles: process.env.SkipVectorTileValidation ? false : true
  });

  function fail(err) {
    if (err.name === 'DeserializationError') return callback(invalid('%s: %s', err.name, err.message));
    else return callback(err);
  }

  fs.stat(opts.filepath, function(err, stat) {
    if (err) return callback(err);
    
    if (stat.size > limits.max_filesize) {
      return callback(invalid('File is larger than ' + prettyBytes(limits.max_filesize) + '. Too big to process.'));
    }
    
    var read = fs.createReadStream(opts.filepath);
    read.pipe(zlib.createGunzip())
      .pipe(tilelive.deserialize())
      .once('error', fail)
      .pipe(validationStream)
      .once('error', fail)
      .on('finish', function(err) {
          util.info(opts.uri,callback);
      }).resume();
  });
}

function validType(tile) {
  return tiletype.type(tile.buffer);
}

function validLength(tile, limit) {
  limit = limit || uploadLimits.serialtiles.max_tilesize;
  return tile.buffer.length <= limit;
}

function validVectorTile(tile, callback) {
  var vtile = new mapnik.VectorTile(tile.z, tile.x, tile.y);

  zlib.gunzip(tile.buffer, function(err, data) {
    if (err) return callback(invalid(err.message));

    vtile.setData(data, function(err) {
      if (err) {
        err.name = 'DeserializationError';
        err.message = 'Invalid data';
        return callback(err);
      }

      if (vtile.empty()) return callback(invalid('Tile is empty'));

      return callback();
    });
  });
}

function ValidationStream(options) {
  var validationStream = new stream.Transform({ objectMode: true });
  validationStream.tiles = 0;
  validationStream.max = options.numTiles || Infinity;

  validationStream._transform = function(tile, enc, callback) {
    if (!tile.buffer) return callback();

    if (validationStream.tiles >= validationStream.max) {
      validationStream.push(tile);
      validationStream.tiles++;
      return callback();
    }

    var format = validType(tile);
    if (!format) return callback(invalid('Invalid tiletype'));

    if (!validLength(tile, options.sizeLimit))
      return callback(invalid('Tile exceeds maximum size of ' + Math.round(options.sizeLimit / 1024) + 'k at z' + tile.z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));

    if (!options.validateVectorTiles || format !== 'pbf') {
      validationStream.push(tile);
      validationStream.tiles++;
      return callback();
    }

    validVectorTile(tile, function(err) {
      if (err) return callback(err);
      validationStream.push(tile);
      validationStream.tiles++;
      return callback();
    });
  };

  return validationStream;
}
