var tilelive = require('tilelive');
var invalid = require('../invalid');

module.exports.info = function validateInfo(uri, limits, callback) {
  if (!callback) {
    callback = limits;
    limits = { max_metadata: 60 * 1024 };
  }

  tilelive.info(uri, function(err, info) {
    if (err) return callback(invalid(err));
    if (info.prepare) return callback(invalid('Source cannot contain prepare key'));

    err = tilelive.verify(info);
    if (err) return callback(invalid(err));

    if (JSON.stringify(info).length > limits.max_metadata)
      return callback(invalid('Metadata exceeds limit of %sk.', (limits.max_metadata / 1024).toFixed(1)));

    callback(null, info);
  });
};

module.exports.source = function validateSource(uri, callback) {
  tilelive.load(uri, function(err, source) {
    if (err) return callback(invalid(err));
    callback(null, source);
  });
};

