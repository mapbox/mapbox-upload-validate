var fs = require('fs');
var invalid = require('../invalid');
var uploadLimits = require('mapbox-upload-limits');
var prettyBytes = require('pretty-bytes');
var util = require('./util');

module.exports = function validateTm2z(opts, callback) {
  var limits = opts.limits || uploadLimits.tm2z;

  fs.stat(opts.filepath, function(err, stat) {
    if (err) return callback(err);
    if (stat.size > limits.max_filesize) {
      return callback(invalid('File is larger than ' + prettyBytes(limits.max_filesize) + '. Too big to process.'));
    }
    util.info(opts.uri,function(err,info) {
      if (err) return callback(err);
      if (JSON.stringify(info).length > limits.max_metadata) {
        return callback(invalid('Metadata exceeds limit of %sk.', (limits.max_metadata / 1024).toFixed(1)));
      }

      util.source(opts.uri,function(err,source) {
        if (err) return callback(err);
        source.profile(function(err, stats) {
          if (err && err.code === 'EMAPNIK') return callback(invalid('Invalid style'));

          if (stats.drawtime.max > limits.max_drawtime)
            return callback(invalid('At least one tile exceeds the draw time limit of %sms. Please optimize your styles.', limits.max_drawtime));
          if (stats.drawtime.avg > limits.avg_drawtime)
            return callback(invalid('The average tile draw time exceeds the limit of %sms. Please optimize your styles.', limits.avg_drawtime));
          if (stats.imgbytes.max > limits.max_imgbytes)
            return callback(invalid('At least one rendered tile exceeds the file size limit of %sk. Try lowering the number of PNG colors or JPEG quality in your project settings.', (limits.max_imgbytes / 1024).toFixed(1)));
          if (stats.imgbytes.avg > limits.avg_imgbytes)
            return callback(invalid('The average rendered tile exceeds the file size limit of %sk. Try lowering the number of PNG colors or JPEG quality in your project settings.', (limits.avg_imgbytes / 1024).toFixed(1)));
          callback();
        });
      });
    })
  });
};
