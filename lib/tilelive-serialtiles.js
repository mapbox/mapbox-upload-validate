/* jshint esversion: 6 */
'use strict';

const url = require('url');
const fs = require('fs');
const split = require('split');
const zlib = require('zlib');

module.exports = Serialtiles;

function Serialtiles(uri, callback) {
  const filepath = url.parse(uri).pathname;
  const serialtiles = this;

  fs.stat(filepath, (err, stats) => {
    if (err) return callback(err);
    serialtiles.filestats = stats;
    serialtiles.filepath = filepath;
    callback(null, serialtiles);
  });
}

Serialtiles.prototype.getInfo = function(callback) {
  let gotInfo = false;
  const read = fs.createReadStream(this.filepath).pipe(zlib.createGunzip());

  read.pipe(split())
    .on('data', (item) => {
      const isInfo = item !== 'JSONBREAKFASTTIME' && item.indexOf('{"z":') !== 0 && item.length;
      if (isInfo && !gotInfo) {
        gotInfo = true;

        try {
          item = JSON.parse(item);
          callback(null, item);
        }
        catch (err) {
          callback(err);
        }

        read.unpipe(split);
      }
    })
    .on('end', () => {
      if (!gotInfo) callback(new Error('Missing Info object'));
    });
};

Serialtiles.prototype.getTile = function(z, x, y, callback) {
  callback(new Error('Not implemented'));
};

Serialtiles.registerProtocols = function(tilelive) {
  tilelive.protocols['serialtiles:'] = Serialtiles;
};
