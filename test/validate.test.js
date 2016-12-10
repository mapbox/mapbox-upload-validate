var test = require('tape').test;
var validate = require('../lib/validate');
var fixtures = require('./fixtures');
//var expected = require('./expected');
var queue = require('queue-async');
//var testUtils = require('./util');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

var validFiletypes = Object.keys(fixtures.valid);
var validProtocols = validFiletypes.map(function(k) {
  if (k.indexOf('mbtiles') === 0) return 'mbtiles:';
  if (k === 'csv') return 'omnivore:';
  if (k === 'shp') return 'omnivore:';
  if (k === 'tif') return 'omnivore:';
  if (k === 'geojson') return 'omnivore:';
  if (k === 'kml') return 'omnivore:';
  if (k === 'gpx') return 'omnivore:';
  if (k === 'tilejson') return 'tilejson:';
  if (k === 'tm2z') return 'tm2z:';
  if (k.indexOf('serialtiles') === 0) return 'serialtiles:';
});

test('lib.validate.filepath: unsupported file', function(t) {
  validate(fixtures.invalid.unsupported, function(err, protocol) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(protocol, 'no protocol returned');
    t.end();
  });
});
