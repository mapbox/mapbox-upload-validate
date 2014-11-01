var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var tilejson = require('../lib/validate').tilejson;
var validHosts = require('../lib/validators/tilejson').validHosts;
var tilelive = require('tilelive');
var _ = require('underscore');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, limits, callback) {
  if (!callback) {
    callback = limits;
    limits = null;
  }

  tilelive.load('tilejson://' + filepath, function(err, source) {
    if (err) throw err;

    var opts = {
      filepath: filepath,
      protocol: 'tilejson:',
      info: expected.info.tilejson,
      source: source
    };
    if (limits) opts.limits = limits;

    tilejson(opts, callback);
  });
}

test('lib.validators.tilejson: hostnames', function(t) {
  t.ok(validHosts.test('tilemill.backend'), 'host is valid');
  t.ok(validHosts.test('a.tilemill.backend'), 'host is valid');
  t.ok(validHosts.test('tiles.mapbox.com'), 'host is valid');
  t.ok(validHosts.test('a.tiles.mapbox.com'), 'host is valid');
  t.ok(validHosts.test('mapbox-staff.s3.amazonaws.com'), 'host is valid');
  t.ok(validHosts.test('mapbox-sandbox-staff.s3.amazonaws.com'), 'host is valid');
  t.ok(validHosts.test('mapbox-satellite.s3.amazonaws.com'), 'host is valid');
  t.ok(validHosts.test('mapbox-cloudless-testing.s3.amazonaws.com'), 'host is valid');
  t.ok(validHosts.test('mapbox-pixelmonster.s3.amazonaws.com'), 'host is valid');

  t.notOk(validHosts.test('bogus-mapbox-cloudless-testing.s3.amazonaws.com'), 'invalid host rejected');
  t.notOk(validHosts.test('mapbox-cloudless-testing.s3.amazonaws.com.eu'), 'invalid host rejected');
  t.notOk(validHosts.test('mapbox-fake.s3.amazonaws.com'), 'invalid host rejected');
  t.notOk(validHosts.test('tilemill.backend.com'), 'invalid host rejected');

  t.end();
});

test('lib.validators.tilejson: valid', function(t) {
  validate(fixtures.valid.tilejson, function(err) {
    t.ifError(err, 'does not error');
    t.end();
  });
});

test('lib.validators.tilejson: invalid metadata size', function(t) {
  validate(fixtures.valid.tilejson, { max_metadata: 50 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.tilejsonErrors.metadatasize, 'expected error message');
    t.end();
  });
});
