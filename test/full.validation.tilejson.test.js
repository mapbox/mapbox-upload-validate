var test = require('tape').test;
var validate = require('..');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

test('full tilejson validation: invalid', function(t) {
  var q = queue();
  Object.keys(fixtures.invalid.tilejson).forEach(function(k) {
    q.defer(function(callback) {
      validate(fixtures.invalid.tilejson[k], function(err, valid, message) {
        t.ifError(err, 'no error');
        t.notOk(valid, 'is not valid');
        t.equal(message, expected.tilejsonErrors[k], 'expected message');
        callback();
      });
    });
  });
  q.await(t.end.bind(t));
});

test('full tilejson validation: valid', function(t) {
  validate(fixtures.valid.tilejson, function(err, valid, message) {
    t.ifError(err, 'no error');
    t.ok(valid, 'is valid');
    t.notOk(message, 'no message');
    t.end();
  });
});
