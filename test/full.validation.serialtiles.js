var test = require('tape').test;
var validate = require('..');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

test('full serialtiles validation: invalid', function(t) {
  var q = queue();
  Object.keys(fixtures.invalid.serialtiles).forEach(function(k) {
    q.defer(function(callback) {
      validate(fixtures.invalid.serialtiles[k], function(err, valid, message) {
        t.ifError(err, 'no error');
        t.notOk(valid, 'is not valid');
        t.equal(message, expected.serialtilesErrors[k], 'expected message');
        callback();
      });
    });
  });
  q.await(t.end.bind(t));
});

test('full serialtiles validation: valid', function(t) {
  validate(fixtures.valid.serialtiles, function(err, valid, message) {
    t.ifError(err, 'no error');
    t.ok(valid, 'is valid');
    t.notOk(message, 'no message');
    t.end();
  });
});
