var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var omnivore = require('../lib/validate').omnivore;
var tilelive = require('tilelive');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, maxSize, callback) {
  if (!callback) {
    callback = maxSize;
    maxSize = null;
  }

  tilelive.load('omnivore://' + filepath, function(err, source) {
    if (err) throw err;

    var opts = {
      filepath: filepath,
      protocol: 'omnivore:',
      info: expected.info.tilejson,
      source: source
    };
    if (maxSize) opts.limits = { max_filesize: maxSize };
    omnivore(opts, callback);
  });
}

test('lib.validators.omnivore: shp file too big', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.valid.shp, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.omnivoreErrors.shpfilesize, 'expected error message');
  });
});

test('lib.validators.omnivore: tif file too big', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.valid.tif, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.omnivoreErrors.tiffilesize, 'expected error message');
  });
});

test('lib.validators.omnivore: csv file too big', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.valid.csv, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.omnivoreErrors.csvfilesize, 'expected error message');
  });
});
