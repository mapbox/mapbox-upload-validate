var test = require('tape').test;
var validate = require('..');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

test('full tm2z validation: invalid', function(t) {
  var q = queue();
  Object.keys(fixtures.invalid.tm2z).forEach(function(k) {
    q.defer(function(callback) {
      validate(fixtures.invalid.tm2z[k], function(err, valid, message) {
        t.ifError(err, 'no error');
        t.notOk(valid, 'is not valid');
        t.equal(message, expected.tm2zErrors[k], 'expected message');
        callback();
      });
    });
  });
  q.await(t.end.bind(t));
});

test('full tm2z validation: valid', function(t) {
  console.log('please be patient while tm2z is profiled...');
  validate(fixtures.valid.tm2z, function(err, valid, message) {
    t.ifError(err, 'no error');
    t.ok(valid, 'is valid');
    t.notOk(message, 'no message');
    t.end();
  });
});
