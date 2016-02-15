var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var serialtiles = require('../lib/validate').serialtiles;
var tilelive = require('tilelive');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, limits, callback) {
  if (!callback) {
    callback = limits;
    limits = null;
  }

  tilelive.load('serialtiles://' + filepath, function(err, source) {
    if (err) throw err;

    var opts = {
      filepath: filepath,
      protocol: 'serialtiles:',
      info: expected.info.tilejson,
      source: source
    };

    if (limits) opts.limits = limits;
    serialtiles(opts, callback);
  });
}

test('lib.validators.serialtiles: tile too big', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.valid.serialtiles, { max_tilesize: 1024 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.tilesize, 'expected error message');
  });
});

test('lib.validators.serialtiles: file too big', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.valid.serialtiles, { max_filesize: 1024 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.filetoobig, 'expected error message');
  });
});

test('lib.validators.serialtiles: invalid gzipped file format', function(t) {
  t.plan(3);
  validate(fixtures.invalid.serialtiles.gzipped, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.gzipped, 'expected error message');
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
  t.plan(3);
  validate(fixtures.invalid.serialtiles.tiletype, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtilesErrors.tiletype, 'expected error message');
  });
});

test('lib.validators.serialtiles: valid PBF', function(t) {
  t.plan(1); // assert that callback is not fired more than once
  validate(fixtures.valid.serialtiles_pbf, function(err) {
    t.ifError(err, 'no error');
    t.end();
  });
});

test('lib.validators.serialtiles: valid PNG', function(t) {
  t.plan(1);
  validate(fixtures.valid.serialtiles_png, function(err) {
    t.ifError(err, 'no error');
    t.end();
  });
});

test('lib.validators.serialtiles: skip vector-tile validation', function(t) {
  process.env.SkipVectorTileValidation = 1;
  validate(fixtures.invalid.serialtiles.gzipped, function(err) {
    t.ifError(err, 'no error');
    t.end();
  });
});

test('lib.validators.serialtiles: skip', function(t) {
  process.env.SkipSerialtilesValidation = 1;
  validate(fixtures.valid.serialtiles, { max_tilesize: 1024 }, function(err) {
    t.ifError(err, 'no error');
    t.end();
  });
});
