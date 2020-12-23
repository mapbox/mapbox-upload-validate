/* jshint esversion: 6 */
'use strict';

const tilelive = require('@mapbox/tilelive');
const uploadLimits = require('mapbox-upload-limits');
const fs = require('fs');
const zlib = require('zlib');
const invalid = require('../invalid');
const mapnik = require('mapnik');
const tiletype = require('@mapbox/tiletype');
const stream = require('stream');
const prettyBytes = require('pretty-bytes');

module.exports = validateSerialtiles;
module.exports.validType = validType;
module.exports.validLength = validLength;
module.exports.validVectoTile = validVectorTile;
module.exports.ValidationStream = ValidationStream;

function validateSerialtiles(opts, callback) {
  if (process.env.SkipSerialtilesValidation) return callback();
  const limits = opts.limits || uploadLimits.serialtiles;

  const validationStream = ValidationStream({
    sizeLimit: limits.max_tilesize,
    validateVectorTiles: process.env.SkipVectorTileValidation ? false : true
  });


  let failed = false;
  function fail(err) {
    failed = true;
    if (err.name === 'DeserializationError') return callback(invalid('%s: %s', err.name, err.message));
    else return callback(err);
  }

  fs.stat(opts.filepath, (err, stat) => {
    if (err) return callback(err);

    if (stat.size > limits.max_filesize) {
      return callback(invalid('File is larger than ' + prettyBytes(limits.max_filesize) + '. Too big to process.'));
    }
    const read = fs.createReadStream(opts.filepath);
    read.pipe(zlib.createGunzip())
      .pipe(tilelive.deserialize())
      .once('error', fail)
      .pipe(validationStream)
      .once('error', fail)
      .on('finish', () => { if (!failed) callback(); })
      .resume();
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
  const vtile = new mapnik.VectorTile(tile.z, tile.x, tile.y);

  zlib.gunzip(tile.buffer, (err, data) => {
    if (err) return callback(invalid(err.message));

    vtile.setData(data, (err) => {
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
  const validationStream = new stream.Transform({ objectMode: true });
  validationStream.tiles = 0;
  validationStream.max = options.numTiles || Infinity;

  validationStream._transform = (tile, enc, callback) => {
    if (!tile.buffer) return callback();

    if (validationStream.tiles >= validationStream.max) {
      validationStream.push(tile);
      validationStream.tiles++;
      return callback();
    }

    const format = validType(tile);
    if (!format) return callback(invalid('Invalid tiletype'));

    if (!validLength(tile, options.sizeLimit))
      return callback(invalid('Tile exceeds maximum size of ' + Math.round(options.sizeLimit / 1024) + 'k at z' + tile.z + '. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.'));

    if (!options.validateVectorTiles || format !== 'pbf') {
      validationStream.push(tile);
      validationStream.tiles++;
      return callback();
    }

    validVectorTile(tile, (err) => {
      if (err) return callback(err);
      validationStream.push(tile);
      validationStream.tiles++;
      return callback();
    });
  };

  return validationStream;
}
