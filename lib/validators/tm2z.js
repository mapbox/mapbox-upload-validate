var util = require('util');

module.exports = function validateTm2z(opts, callback) {
  var limits = opts.limits || {
    max_metadata: 1024 * 60,
    max_drawtime: 1000,
    avg_drawtime: 300,
    max_imgbytes: 100 * 1024,
    avg_imgbytes: 50 * 1024
  };

  if (JSON.stringify(opts.info).length > limits.max_metadata) {
    return callback(util.format('Metadata exceeds limit of %sk.', (limits.max_metadata/1024).toFixed(1)));
  }

  opts.source.profile(function(err, stats) {
    if (err) return callback(err);

    if (stats.drawtime.max > limits.max_drawtime)
      return callback(new Error(util.format('At least one tile exceeds the draw time limit of %sms. Please optimize your styles.', limits.max_drawtime)));
    if (stats.drawtime.avg > limits.avg_drawtime)
      return callback(new Error(util.format('The average tile draw time exceeds the limit of %sms. Please optimize your styles.', limits.avg_drawtime)));
    if (stats.imgbytes.max > limits.max_imgbytes)
      return callback(new Error(util.format('At least one rendered tile exceeds the file size limit of %sk. Try lowering the number of PNG colors or JPEG quality in your project settings.', (limits.max_imgbytes/1024).toFixed(1))));
    if (stats.imgbytes.avg > limits.avg_imgbytes)
      return callback(new Error(util.format('The average rendered tile exceeds the file size limit of %sk. Try lowering the number of PNG colors or JPEG quality in your project settings.', (limits.avg_imgbytes/1024).toFixed(1))));
    callback();
  });
};
