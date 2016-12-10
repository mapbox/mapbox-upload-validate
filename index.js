var validate = require('./lib/validate');

module.exports = function(filepath, callback) {
  var results = {};

  function fail(err) {
    err = err || new Error('Any unspecified error was encountered');
    if (err && err.code === 'EINVALID') return callback(null, false, err.message);
    return callback(err);
  }
  return validate(filepath,function(err) {
    if (err) return fail(err);
    return callback(null,true);
  });
};
