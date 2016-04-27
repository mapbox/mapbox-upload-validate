var fs = require('fs');
var uploadLimits = require('mapbox-upload-limits');
var prettyBytes = require('pretty-bytes');
var path = require('path');
var queue = require('queue-async');
var invalid = require('../invalid');
var sniffer = require('mapbox-file-sniff');
var getMetadata = require('mapnik-omnivore').digest;

module.exports = function validateOmnivore(opts, callback) {
  var dir = path.dirname(opts.filepath);
  var ext = path.extname(opts.filepath);
  var base = path.basename(opts.filepath, ext);
  var limits;

  var files = ext === '.shp' ?
    [ opts.filepath, path.join(dir, base + '.dbf') ] :
    [ opts.filepath ];

  sniffer.quaff(opts.filepath, function(err, filetype) {
    if (err) return callback(err);

    if (filetype === 'tif') limits = opts.limits || uploadLimits.tif;
    else if (filetype === 'csv') limits = opts.limits || uploadLimits.csv;
    else if (filetype === 'geojson') limits = opts.limits || uploadLimits.geojson;
    else if (filetype === 'kml') limits = opts.limits || uploadLimits.kml;
    else limits = opts.limits || uploadLimits.omnivoreOther;

    getMetadata(opts.filepath, function(err, metadata) {
      if (err) return callback(err);
      // Stopgap while only 8 bit TIFFs are supported
      if (filetype === 'kml') {
        var layers = metadata.layers.length;
        if (layers > uploadLimits.kml.layers) {
          return callback(invalid('%d layers found. Maximum of %d layers allowed.', layers, uploadLimits.kml.layers));
        }
      }

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

        if (size > limits.max_filesize) {
          return callback(invalid('File is larger than ' + prettyBytes(limits.max_filesize) + '. Too big to process.'));
        }
        callback();
      });
    });
  });
};
