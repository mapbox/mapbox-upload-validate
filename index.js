var validate = require('./lib/validate');
var Step = require('step');

var results = {};

module.exports = function(filepath, callback) {
  function fail(err) {
    err = err || new Error('Any unspecified error was encountered');
    if (err && err.code === 'EINVALID') return callback(null, false, err.message);
    return callback(err);
  }

  Step(
    function() {
      validate.filepath(filepath, this);
    },
    function(err, protocol) {
      if (err) return fail(err);
      results.protocol = protocol;
      results.uri = protocol + '//' + filepath;
      validate.info(results.uri, this);
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
