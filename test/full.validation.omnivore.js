var test = require('tape').test;
var validate = require('..');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

test('full omnivore validation: invalid', function(t) {
  var q = queue();
  Object.keys(fixtures.invalid.omnivore).forEach(function(k) {
    q.defer(function(callback) {
      validate(fixtures.invalid.omnivore[k], function(err, valid, message) {
        t.ifError(err, 'no error: ' + k);
        t.notOk(valid, 'is not valid: ' + k);
        t.ok(message.indexOf(expected.omnivoreErrors[k]) == 0, 'expected message');
        callback();
      });
    });
  });
  q.await(t.end.bind(t));
});

test('full omnivore validation: valid', function(t) {
  var q = queue();
  ['geojson', 'gpx', 'kml', 'shp', 'tif'].forEach(function(k) {
    q.defer(function(callback) {
      validate(fixtures.valid[k], function(err, valid, message) {
        t.ifError(err, 'no error: ' + k);
        t.ok(valid, 'is valid: ' + k);
        t.notOk(message, 'no message: ' + k);
        callback();
      });
    });
  });
  q.await(t.end.bind(t));
});
