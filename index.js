var validate = require('./lib/validate');
var Step = require('step');

module.exports = function(filepath, callback) {
  var results = {};

  function fail(err) {
    err = err || new Error('Any unspecified error was encountered');
    if (err && err.code === 'EINVALID') return callback(null, false, err.message);
    return callback(err);
  }

  Step(
    function() {
      validate.filepath(filepath, this);
    },
    function(err, fileinfo) {
      if (err) return fail(err);
      results.filepath = filepath;
      results.protocol = fileinfo.protocol;
      results.filetype = fileinfo.filetype;
      results.uri = fileinfo.protocol + '//' + filepath;
      validate.info(results, this);
    },
    function(err, info) {
      if (err) return fail(err);
      results.info = info;
      validate.source(results.uri, this);
    },
    function(err, source) {
      if (err) return fail(err);
      results.source = source;
      validate[results.protocol.slice(0,-1)](results, this);
    },
    function(err) {
      if (err) return fail(err);
      callback(null, true);
    }
  );
};
