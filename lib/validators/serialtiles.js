var tilelive = require('tilelive');
var uploadLimits = require('mapbox-upload-limits');
var fs = require('fs');
var zlib = require('zlib');
var invalid = require('../invalid');
var prettyBytes = require('pretty-bytes');
var ValidationStream = require('../validationstream');

module.exports = validateSerialtiles;

function validateSerialtiles(opts, callback) {
  if (process.env.SkipVectorTileValidation) return callback();
  var limits = opts.limits || uploadLimits.serialtiles;

  var validationStream = ValidationStream({
    sizeLimit: limits.max_tilesize,
    validateVectorTiles: process.env.SkipVectorTileValidation ? false : true
  });

  function fail(err) {
    if (err.name === 'ValidityError' || err.name === 'DeserializationError') return callback(invalid('%s: %s', err.name, err.message));
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
      .on('finish', callback).resume();
  });
}
