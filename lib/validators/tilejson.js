var util = require('util');
var url = require('url');

module.exports = validateTilejson;

function validateTilejson(opts, callback) {
  var limits = opts.limits || {
    max_metadata: 1024 * 60
  };

  if (JSON.stringify(opts.info).length > limits.max_metadata)
    return callback(util.format('Metadata exceeds limit of %sk.', (limits.max_metadata/1024).toFixed(1)));

  if (opts.info.tiles) {
    for (var i = 0; i < opts.info.tiles.length; i++) {
      if (!validHosts.test(url.parse(opts.info.tiles[i]).hostname))
        return callback(new Error('Invalid hostname in TileJSON'));
    }
  }

  if (opts.info.grids) {
    for (var j = 0; j < opts.info.grids.length; j++) {
      if (!validHosts.test(url.parse(opts.info.grids[j]).hostname))
        return callback(new Error('Invalid hostname in TileJSON'));
    }
  }

  callback();
}

var validHosts = validateTilejson.validHosts = /tilemill\.backend$|tiles\.mapbox\.com$|^mapbox-(staff|sandbox-staff|satellite|cloudless-testing|pixelmonster)\.s3\.amazonaws\.com$/;
