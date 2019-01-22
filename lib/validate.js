var sniffer = require('@mapbox/mapbox-file-sniff');
var path = require('path');

var tilelive = require('@mapbox/tilelive');
var Vector = require('@mapbox/tilelive-vector');
var MBTiles = require('@mapbox/mbtiles');
var Omnivore = require('@mapbox/tilelive-omnivore');
var TileJSON = require('@mapbox/tilejson');
var Serialtiles = require('../lib/tilelive-serialtiles');
var Mapbox = require('../lib/tilelive-mapbox');
var invalid = require('./invalid');
var kmlValidator = require('./validators/kml.js');
var log = require('fastlog')('configuration');
var prettyBytes = require('pretty-bytes');

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

module.exports.limits = function loadLimits() {
  var limits = {
    max_metadata: 60 * 1024
  };
  // copy to defaults:
  limits._defaults = JSON.parse(JSON.stringify(limits));

  // allow env overrides
  for(var limit in limits) {
    var env = 'LIMITS_' + limit.toUpperCase();
    var val = process.env[env];
    if(val) {
      if(val.length === 0 || isNaN(val)) {
        log.warn('Environment variable specified ' + env + ', but value is invalid: ' + val + '. The default (' + limits._defaults[limit] + ') will be used.');
      } else {
        log.info('Environment variable ' + env + ' overrides default ' + limits._defaults[limit] + ' => ' + val);
        limits[limit] = +val;
      }
    }
  }

  return limits;
}();

module.exports.filepath = function validateFilepath(filepath, callback) {
  filepath = path.resolve(filepath);

  sniffer.fromFile(filepath, function(err, info) {
    if (err) return callback(invalid(err));
    return callback(null, {
      protocol: info.protocol,
      filetype: info.type
    });
  });
};

module.exports.info = function validateInfo(info, limits, callback) {
  if (!callback) {
    callback = limits;
    limits = module.exports.limits;
  }

  // Lightweight KML validation before gdal/mapnik KML drivers
  // which never finish if KMLs have too many layers
  if (info.filetype === 'kml') {
    var kmlValid = kmlValidator(info.filepath);
    if (kmlValid !== true) {
      return callback(invalid(kmlValid));
    }
  }

  tilelive.info(info.uri, function(err, info) {
    if (err) return callback(invalid(err));
    if (info.prepare) return callback(invalid('Source cannot contain prepare key'));

    err = tilelive.verify(info);
    if (err) return callback(invalid(err));

    // don't count pre-generated tilestats objects from mbtiles
    if (info.tilestats) delete info.tilestats;

    var metadataLength = JSON.stringify(info).length;
    if (metadataLength > limits.max_metadata)
      return callback(invalid('Metadata ' + prettyBytes(metadataLength) + ' exceeds limit of ' + prettyBytes(limits.max_metadata) + '.'));

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
module.exports.kml = require('./validators/kml');
