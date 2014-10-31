var test = require('tape').test;
var validate = require('../lib/validate');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');
var testUtils = require('./util');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

var validFiletypes = Object.keys(fixtures.valid);
var validProtocols = validFiletypes.map(function(k) {
  if (k === 'mbtiles') return 'mbtiles:';
  if (k === 'shp') return 'omnivore:';
  if (k === 'tif') return 'omnivore:';
  if (k === 'geojson') return 'omnivore:';
  if (k === 'kml') return 'omnivore:';
  if (k === 'gpx') return 'omnivore:';
  if (k === 'tilejson') return 'tilejson:';
  if (k === 'tm2z') return 'tm2z:';
  if (k === 'serialtiles') return 'serialtiles:';
});

test('lib.validate.fail', function(t) {
  var msg = 'some error message';
  var err = validate.fail(msg);
  t.ok(err instanceof Error, 'returns an error');
  t.equal(err.message, msg, 'returns expected error message');
  t.equal(err.code, 'EINVALID', 'returns expected error code');

  msg = new Error(msg);
  msg.stack = 'stack trace';
  err = validate.fail(msg);
  t.ok(err instanceof Error, 'returns an error');
  t.equal(err.message, msg.message, 'returns expected error message');
  t.equal(err.code, 'EINVALID', 'returns expected error code');
  t.equal(err.stack, msg.stack, 'returns stack trace');

  t.end();
});

test('lib.validate.filepath: valid', function(t) {
  var q = queue();
  validFiletypes.forEach(function(k) {
    q.defer(validate.filepath, fixtures.valid[k]);
  });
  q.awaitAll(function(err, protocols) {
    t.ifError(err, 'does not error on valid file types');
    t.deepEqual(protocols, validProtocols, 'returned expected protocols');
    t.end();
  });
});

test('lib.validate.filepath: unsupported file', function(t) {
  validate.filepath(fixtures.invalid.unsupported, function(err, protocol) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(protocol, 'no protocol returned');
    t.end();
  });
});

test('lib.validate.info: valid', function(t) {
  var q = queue();
  var expectedInfos = validFiletypes.map(function(k) {
    return expected.info[k];
  });
  validFiletypes.forEach(function(k, i) {
    q.defer(validate.info, validProtocols[i] + '//' + fixtures.valid[k]);
  });
  q.awaitAll(function(err, infos) {
    t.ifError(err, 'does not error on valid files');
    infos = infos.map(testUtils.infoTruncator);
    t.deepEqual(infos, expectedInfos, 'expected info returned');
    t.end();
  });
});

test('lib.validate.info: unsupported file', function(t) {
  validate.info('nonsense://' + fixtures.invalid.unsupported, function(err, info) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(info, 'no info returned');
    t.end();
  });
});

test('lib.validate.info: invalid data in the file', function(t) {
  validate.info('tilejson://' + fixtures.invalid.tilejson, function(err, info) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(info, 'no info returned');
    t.end();
  });
});

test('lib.validate.source: valid', function(t) {
  var q = queue();
  validFiletypes.forEach(function(k, i) {
    q.defer(validate.source, validProtocols[i] + '//' + fixtures.valid[k]);
  });
  q.awaitAll(function(err, sources) {
    t.ifError(err, 'does not error on valid files');
    valid = sources.reduce(function(memo, source) {
      if (typeof source.getInfo !== 'function') memo = false;
      if (typeof source.getTile !== 'function') memo = false;
      return memo;
    }, true);
    t.ok(valid, 'sources appear valid');
    t.end();
  });
});

test('lib.validate.source: unsupported file', function(t) {
  validate.info('nonsense://' + fixtures.invalid.unsupported, function(err, source) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(source, 'no source returned');
    t.end();
  });
});

test('lib.validate.source: invalid data in the file', function(t) {
  validate.info('tilejson://' + fixtures.invalid.tilejson, function(err, source) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(source, 'no source returned');
    t.end();
  });
});
