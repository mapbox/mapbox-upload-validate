var url = require('url');
var invalid = require('../invalid');
var util = require('./util');

module.exports = validateTilejson;

function validateTilejson(opts, callback) {
  util.info(opts.uri,function(err,info) {
    if (err) return callback(err);

    if (info.tiles) {
      for (var i = 0; i < info.tiles.length; i++) {
        if (!validHosts.test(url.parse(info.tiles[i]).hostname))
          return callback(invalid('Invalid hostname in TileJSON'));
      }
    }

    if (info.grids) {
      for (var j = 0; j < info.grids.length; j++) {
        if (!validHosts.test(url.parse(info.grids[j]).hostname))
          return callback(invalid('Invalid hostname in TileJSON'));
      }
    }
    return callback();
  });
}

var validHosts = validateTilejson.validHosts = /tilemill\.backend$|tiles\.mapbox\.com$|(^mapbox-(satellite|cloudless-testing|pixelmonster)|^tilestream-tilesets-production)\.s3\.amazonaws\.com$/;
