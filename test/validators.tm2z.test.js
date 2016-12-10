var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var tm2z = require('../lib/validate').tm2z;
var tilelive = require('tilelive');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, limits, callback) {
  if (!callback) {
    callback = limits;
    limits = null;
  }

  tilelive.load('tm2z://' + filepath, function(err, source) {
    if (err) throw err;

    var opts = {
      filepath: filepath,
      protocol: 'tm2z:',
      info: expected.info.tm2z,
      source: source,
      uri: 'tm2z://' + filepath
    };
    if (limits) opts.limits = limits;

    tm2z(opts, callback);
  });
}

test('lib.validators.tm2z: valid', function(t) {
  console.log('please be patient while tm2z is profiled...');
  validate(fixtures.valid.tm2z, function(err) {
    t.ifError(err, 'does not error');
    t.end();
  });
});

test('lib.validators.tm2z: invalid metadata size', function(t) {
  validate(fixtures.valid.tm2z, { max_metadata: 50 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.tm2zErrors.metadatasize, 'expected error message');
    t.end();
  });
});

test('lib.validators.tm2z: invalid max drawtime', function(t) {
  validate(fixtures.valid.tm2z, { max_drawtime: 1 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.tm2zErrors.maxdrawtime, 'expected error message');
    t.end();
  });
});

test('lib.validators.tm2z: invalid avg drawtime', function(t) {
  validate(fixtures.valid.tm2z, { avg_drawtime: 1 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.tm2zErrors.avgdrawtime, 'expected error message');
    t.end();
  });
});

test('lib.validators.tm2z: invalid max imgbytes', function(t) {
  validate(fixtures.valid.tm2z, { max_imgbytes: 1 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.tm2zErrors.maximgbytes, 'expected error message');
    t.end();
  });
});

test('lib.validators.tm2z: invalid avg imgbytes', function(t) {
  validate(fixtures.valid.tm2z, { avg_imgbytes: 1 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.tm2zErrors.avgimgbytes, 'expected error message');
    t.end();
  });
});

test('lib.validators.tm2z: filesize too big', function(t) {
  validate(fixtures.valid.tm2z, { max_filesize: 1024 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.tm2zErrors.filetoobig, 'expected error message');
    t.end();
  });
});
