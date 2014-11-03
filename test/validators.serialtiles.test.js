var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var serialtiles = require('../lib/validate').serialtiles;
var tilelive = require('tilelive');
var _ = require('underscore');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, maxSize, callback) {
  if (!callback) {
    callback = limits;
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
    if (maxSize) opts.max_tilesize = maxSize;
    serialtiles(opts, callback);
  });
}

test('lib.validators.serialtiles: tile too big', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.valid.serialtiles, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.serialtileErrors.tilesize, 'expected error message');
  });
});

test('lib.validators.serialtiles: skip', function(t) {
  process.env.SkipSerialtilesValidation = 1;
  validate(fixtures.valid.serialtiles, 1024, function(err) {
    t.ifError(err, 'no error');
    t.end();
  });
});
