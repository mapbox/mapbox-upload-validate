var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var serialtiles = require('../lib/validate').serialtiles;
var tilelive = require('tilelive');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, maxSize, callback) {
  if (!callback) {
    callback = maxSize;
    maxSize = null;
  }

  tilelive.load('serialtiles://' + filepath, function(err, source) {
    if (err) throw err;

    var opts = {
      filepath: filepath,
      protocol: 'serialtiles:',
      info: expected.info.tilejson,
      source: source
    };
    if (maxSize) opts.limits = { max_tilesize: maxSize };
    serialtiles(opts, callback);
  });
}

test('lib.validators.serialtiles: tile too big', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.valid.serialtiles, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.tilesize, 'expected error message');
  });
});

test('lib.validators.serialtiles: failure to deserialize', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.invalid.serialtiles.cantdeserialize, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.cantdeserialize, 'expected error message');
  });
});

test('lib.validators.serialtiles: invalid tiletype', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.invalid.serialtiles.tiletype, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.tiletype, 'expected error message');
  });
});

test('lib.validators.serialtiles: buffer not gzipped', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.invalid.serialtiles.ungzipped, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.ungzipped, 'expected error message');
  });
});

test('lib.validators.serialtiles: skip', function(t) {
  process.env.SkipSerialtilesValidation = 1;
  validate(fixtures.valid.serialtiles, 1024, function(err) {
    t.ifError(err, 'no error');
    t.end();
  });
});
