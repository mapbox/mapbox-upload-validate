var util = require('util');

module.exports = function validateTm2z(opts, callback) {
  var limits = {
    max_metadata: 1024 * 60,
    max_drawtime_max: 1000,
    max_drawtime_avg: 300,
    max_imgbytes_max: 100 * 1024,
    max_imgbytes_avg: 50 * 1024
  };

  if (JSON.stringify(opts.info).length > limits.max_metadata) {
    return callback(util.format('Metadata exceeds limit of %sk.', (limits.max_metadata/1024).toFixed(1)));
  }

  opts.source.profile(function(err, stats) {
    if (err) return callback(err);

    if (stats.drawtime.max > limits.max_drawtime_max)
      return callback(new Error(util.format('At least one tile exceeds the draw time limit of %sms. Please optimize your styles.', limits.max_drawtime_max)));
    if (stats.drawtime.avg > limits.max_drawtime_avg)
      return callback(new Error(util.format('The average tile draw time exceeds the limit of %sms. Please optimize your styles.', limits.max_drawtime_avg)));
    if (stats.imgbytes.max > limits.max_imgbytes_max)
      return callback(new Error(util.format('At least one rendered tile exceeds the file size limit of %sk. Try lowering the number of PNG colors or JPEG quality in your project settings.', (limits.max_imgbytes_max/1024).toFixed(1))));
    if (stats.imgbytes.avg > limits.max_imgbytes_avg)
      return callback(new Error(util.format('The average rendered tile exceeds the file size limit of %sk. Try lowering the number of PNG colors or JPEG quality in your project settings.', (limits.max_imgbytes_avg/1024).toFixed(1))));
    callback();
  });
};
