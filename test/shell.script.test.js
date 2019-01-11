var exec = require('child_process').exec;
var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var path = require('path');
var queue = require('queue-async');
var _ = require('underscore');
var run = path.resolve(__dirname, '../bin/mapbox-upload-validate.js');

test('bin.mapbox-upload-validate: invalid', function(t) {
  function validate(type, filepath, reason, callback) {
    if (!callback) {
      callback = reason;
      reason = undefined;
    }

    exec(['NODE_NO_WARNINGS=1', run, filepath].join(' '), function(err, stdout, stderr) {
      console.log('# bin.mapbox-upload-validate: invalid', path.basename(filepath));
      t.equal(err.code, 3, 'exit 3');
      t.equal(stdout, '', [type, reason].join('.') + ': nothing logged to stdout');
      var expect = expected[type + 'Errors'];
      if (reason) expect = expect[reason];

      t.ok(stderr.indexOf(expect) > -1, [type, reason].join('.') + ': expected error message');
      callback();
    });
  }

  var q = queue();
  _(fixtures.invalid).forEach(function(val, type) {
    if (typeof val === 'string') return q.defer(validate, type, val);
    _(val).forEach(function(filepath, reason) {
      q.defer(validate, type, filepath, reason);
    });
  });
  q.await(function() {
    t.end();
  });
});

test('bin.mapbox-upload-validate: valid', function(t) {
  var q = queue();
  Object.keys(fixtures.valid).forEach(function(k) {
    q.defer(function(callback) {
      exec(['NODE_NO_WARNINGS=1', run, fixtures.valid[k]].join(' '), function(err, stdout, stderr) {
        if (err) throw err;
        console.log('# bin.mapbox-upload-validate: valid:', path.basename(fixtures.valid[k]));
        t.equal(stdout, fixtures.valid[k] + '\n', k + ': stdout contains filepath');
        t.notOk(stderr, k + ': no error message');
        callback();
      });
    });
  });
  q.await(function() {
    t.end();
  });
});
