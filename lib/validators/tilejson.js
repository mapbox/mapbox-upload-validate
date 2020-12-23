/* jshint esversion: 6 */
'use strict';

const url = require('url');
const invalid = require('../invalid');

module.exports = validateTilejson;

const validHosts = validateTilejson.validHosts = /tilemill\.backend$|tiles\.mapbox\.com$|(^mapbox-(satellite|pixelmonster)|^tilestream-tilesets-production)\.s3\.amazonaws\.com$/;

function validateTilejson(opts, callback) {
  if (opts.info.tiles) {
    for (let i = 0; i < opts.info.tiles.length; i++) {
      if (!validHosts.test(url.parse(opts.info.tiles[i]).hostname))
        return callback(invalid('Invalid hostname in TileJSON'));
    }
  }

  if (opts.info.grids) {
    for (let j = 0; j < opts.info.grids.length; j++) {
      if (!validHosts.test(url.parse(opts.info.grids[j]).hostname))
        return callback(invalid('Invalid hostname in TileJSON'));
    }
  }

  callback();
}
