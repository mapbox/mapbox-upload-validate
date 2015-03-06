var url = require('url');
var fs = require('fs');
var split = require('split');
var zlib = require('zlib');

module.exports = Serialtiles;

function Serialtiles(uri, callback) {
  var filepath = url.parse(uri).pathname;
  var serialtiles = this;

  fs.stat(filepath, function(err, stats) {
    if (err) return callback(err);
    serialtiles.filestats = stats;
    serialtiles.filepath = filepath;
    callback(null, serialtiles);
  });
}

Serialtiles.prototype.getInfo = function(callback) {
  var gotInfo = false;
  var read =  fs.createReadStream(this.filepath).pipe(zlib.createGunzip());

  read.pipe(split())
    .on('data', function(item) {
      var isInfo = item !== 'JSONBREAKFASTTIME' && item.indexOf('{"z":') !== 0 && item.length;
      if (isInfo && !gotInfo) {
        gotInfo = true;

        try {
          item = JSON.parse(item);
          callback(null, item);
        }
        catch(err) {
          callback(err);
        }

        read.unpipe(split);
      }
    })
    .on('end', function() {
      if (!gotInfo) callback(new Error('Missing Info object'));
    });
};

Serialtiles.prototype.getTile = function(z, x, y, callback) {
  callback(new Error('Not implemented'));
};

Serialtiles.registerProtocols = function(tilelive) {
  tilelive.protocols['serialtiles:'] = Serialtiles;
};
