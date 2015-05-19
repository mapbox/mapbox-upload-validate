var sniffer = require('mapbox-file-sniff');
var path = require('path');

var tilelive = require('tilelive');
var Vector = require('tilelive-vector');
var MBTiles = require('mbtiles');
var Omnivore = require('tilelive-omnivore');
var TileJSON = require('tilejson');
var Serialtiles = require('../lib/tilelive-serialtiles');
var Mapbox = require('../lib/tilelive-mapbox');
var invalid = require('./invalid');

Vector.registerProtocols(tilelive);
MBTiles.registerProtocols(tilelive);
Omnivore.registerProtocols(tilelive);
TileJSON.registerProtocols(tilelive);
Serialtiles.registerProtocols(tilelive);
Mapbox.registerProtocols(tilelive);

Vector.mapnik.register_fonts(path.dirname(require.resolve('mapbox-studio-default-fonts')), { recurse: true });
Vector.mapnik.register_fonts(path.dirname(require.resolve('mapbox-studio-pro-fonts')), { recurse: true });
if (process.env.MapboxUploadValidateFonts)
  Vector.mapnik.register_fonts(process.env.MapboxUploadValidateFonts, { recurse: true });

module.exports.filepath = function validateFilepath(filepath, callback) {
  filepath = path.resolve(filepath);
  sniffer.quaff(filepath, true, function(err, protocol) {
    if (err) return callback(invalid(err));
    callback(null, protocol);
  });
};

module.exports.info = function validateInfo(uri, limits, callback) {
  if (!callback) {
    callback = limits;
    limits = { max_metadata: 60 * 1024 };
  }

  tilelive.info(uri, function(err, info) {
    if (err) return callback(invalid(err));
    if (info.prepare) return callback(invalid('Source cannot contain prepare key'));

    err = tilelive.verify(info);
    if (err) return callback(invalid(err));

    if (JSON.stringify(info).length > limits.max_metadata)
      return callback(invalid('Metadata exceeds limit of %sk.', (limits.max_metadata/1024).toFixed(1)));

    callback(null, info);
  });
};

module.exports.source = function validateSource(uri, callback) {
  tilelive.load(uri, function(err, source) {
    if (err) return callback(invalid(err));
    callback(null, source);
  });
};

module.exports.mbtiles = require('./validators/mbtiles');
module.exports.omnivore = require('./validators/omnivore');
module.exports.serialtiles = require('./validators/serialtiles');
module.exports.tilejson = require('./validators/tilejson');
module.exports.tm2z = require('./validators/tm2z');
