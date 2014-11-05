var test = require('tape').test;
var validate = require('..');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

test('full mbtiles validation: invalid', function(t) {
  var q = queue();
  Object.keys(fixtures.invalid.mbtiles).forEach(function(k) {
    q.defer(function(callback) {
      validate(fixtures.invalid.mbtiles[k], function(err, valid, message) {
        t.ifError(err, 'no error: ' + k);
        t.notOk(valid, 'is not valid: ' + k);
        t.equal(message, expected.mbtilesErrors[k], 'expected message');
        callback();
      });
    });
  });
  q.await(function(err) {
    t.ifError(err, 'success');
    t.end();
  });
});

test('full mbtiles validation: valid', function(t) {
  var q = queue();
  Object.keys(fixtures.valid).forEach(function(k) {
    if (k.indexOf('mbtiles') !== 0) return;
    q.defer(function(callback) {
      validate(fixtures.valid[k], function(err, valid, message) {
        t.ifError(err, 'no error: ' + k);
        t.ok(valid, 'is valid: ' + k);
        t.notOk(message, 'no message: ' + k);
        callback();
      });
    });
  });
  q.await(function(err) {
    t.ifError(err, 'success');
    t.end();
  });
});
