var sniffer = require('mapbox-file-sniff');
var path = require('path');
var url = require('url');

var tilelive = require('tilelive');
var Vector = require('tilelive-vector');
var MBTiles = require('mbtiles');
var Omnivore = require('tilelive-omnivore');
var TileJSON = require('tilejson');
var Serialtiles = require('../lib/tilelive-serialtiles');
var Mapbox = require('../lib/tilelive-mapbox');

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

module.exports.fail = fail;

function fail(err) {
  var msg = typeof err === 'string' ? err : err.message;
  var error = new Error(msg);
  error.code = 'EINVALID';
  if (err.stack) error.stack = err.stack;
  return error;
}

module.exports.filepath = function validateFilepath(filepath, callback) {
  filepath = path.resolve(filepath);
  sniffer.quaff(filepath, true, function(err, protocol) {
    if (err) return callback(fail(err));
    callback(null, protocol);
  });
};

module.exports.info = function validateInfo(uri, callback) {
  tilelive.info(uri, function(err, info) {
    if (err) return callback(fail(err));

    err = tilelive.verify(info);
    if (err) return callback(fail(err));

    callback(null, info);
  });
};

module.exports.source = function validateSource(uri, callback) {
  tilelive.load(uri, function(err, source) {
    if (err) return callback(fail(err));
    callback(null, source);
  });
};

module.exports.mbtiles = require('./validators/mbtiles');
module.exports.omnivore = require('./validators/omnivore');
module.exports.serialtiles = require('./validators/serialtiles');
module.exports.tilejson = require('./validators/tilejson');
module.exports.tm2z = require('./validators/tm2z');
