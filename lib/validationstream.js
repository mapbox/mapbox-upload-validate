var stream = require('stream');
var tiletype = require('tiletype');
var mapnik = require('mapnik');
var stream = require('stream');
var uploadLimits = require('mapbox-upload-limits');
var invalid = require('./invalid');

module.exports = ValidationStream;
module.exports.validType = validType;
module.exports.validLength = validLength;
module.exports.validVectorTile = validVectorTile;

function validType(tile) {
  return tiletype.type(tile.buffer);
}

function validLength(tile, limit) {
  limit = limit || uploadLimits.serialtiles.max_tilesize;
  return tile.buffer.length <= limit;
}

function validVectorTile(tile, callback) {
  var info = mapnik.VectorTile.info(tile.buffer);

  // Right now we are just sending a generic error response.
  // We can return more info from Node Mapnik if we need
  // but tests currently check for DeserializationError.
  if (info.errors) {
    var error = {
      name: 'DeserializationError',
      message: 'Invalid data'      
    };
    return callback(error);
  }

  return callback();
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

