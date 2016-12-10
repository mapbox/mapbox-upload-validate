var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var omnivore = require('../lib/validate').omnivore;
var tilelive = require('tilelive');
var mock = require('mock-fs');
var crypto = require('crypto');
var fs = require('fs');

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
      source: source,
      uri: 'omnivore://' + filepath
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

test('lib.validators.omnivore: too many kml layers', function(t) {
  t.plan(3); // assert that callback is not fired more than once
  validate(fixtures.invalid.omnivore.kmllayers, 1024, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.omnivoreErrors.kmllayers, 'expected error message');
  });
});

test('lib.validators.omnivore: tif file bigger than default omnivore size is accepted', function(t) {
  var mockConfig = {};
  mockConfig[fixtures.valid.tif] = Buffer.concat([fs.readFileSync(fixtures.valid.tif), crypto.randomBytes(300 * 1024 * 1024)]);
  mock(mockConfig);
  validate(fixtures.valid.tif, function(err) {
    t.ifError(err, 'accepted 300+ MB tif');
    mock.restore();
    t.end();
  });
});
