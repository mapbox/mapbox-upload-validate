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

module.exports = function(filepath,callback) {
  filepath = path.resolve(filepath);
  sniffer.quaff(filepath, true, function(err, protocol) {
    if (err) return callback(invalid(err));
    var opts = {
      "filepath": filepath,
      "protocol": protocol,
      "uri": protocol + '//' + filepath
    };
    module.exports[protocol.slice(0,-1)](opts, callback);
  });
};

module.exports.mbtiles = require('./validators/mbtiles');
module.exports.omnivore = require('./validators/omnivore');
module.exports.serialtiles = require('./validators/serialtiles');
module.exports.tilejson = require('./validators/tilejson');
module.exports.tm2z = require('./validators/tm2z');
