var fs = require('fs');
var path = require('path');
var queue = require('queue-async');
var invalid = require('../invalid');
var sniffer = require('mapbox-file-sniff');

module.exports = function validateOmnivore(opts, callback) {
  var dir = path.dirname(opts.filepath);
  var ext = path.extname(opts.filepath);
  var base = path.basename(opts.filepath, ext);
  var limits;

  var files = ext === '.shp' ?
    [ opts.filepath, path.join(dir, base + '.dbf') ] :
    [ opts.filepath ];

  getFiletype(opts.filepath, function(err, filetype) {
    if (err) return callback(err);

    if (filetype === 'tif') limits = opts.limits || { max_filesize: 5 * 1024 * 1024 * 1024 };
    else limits = opts.limits || { max_filesize: 260 * 1024 * 1024 };

    var q = queue();
    files.forEach(function(f) {
      q.defer(fs.stat.bind(fs), f);
    });
    q.awaitAll(function(err, stats) {
      if (err) return callback(err);

      var size = stats.reduce(function(memo, stat) {
        memo += stat.size;
        return memo;
      }, 0);

      if (size > limits.max_filesize) return callback(invalid('File is larger than ' + limits.max_filesize + ' bytes. Too big to process.'));
      callback();
    });
  });

  function getFiletype(filepath, callback) {
    var buffer;
    try {
        fs.statSync(filepath);
        buffer = new Buffer(512);
        var fd = fs.openSync(filepath, 'r');
        fs.readSync(fd, buffer, 0, 512, 0);
        fs.closeSync(fd);
    } catch (err) {
        return callback(err);
    }

    sniffer.sniff(buffer, function(err, filetype) {
      if (err) return callback(err);
      return callback(null, filetype);
    });
  };
};