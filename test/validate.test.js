var test = require('tape').test;
var validate = require('../lib/validate');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');
var testUtils = require('./util');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

var validFiletypes = Object.keys(fixtures.valid);
var validProtocols = validFiletypes.map(function(k) {
  if (k.indexOf('mbtiles') === 0) return {protocol: 'mbtiles:', filetype: 'mbtiles'};
  if (k === 'csv') return {protocol: 'omnivore:', filetype: 'csv'};
  if (k === 'shp') return {protocol: 'omnivore:', filetype: 'shp'};
  if (k === 'tif') return {protocol: 'omnivore:', filetype: 'tif'};
  if (k === 'geojson') return {protocol: 'omnivore:', filetype: 'geojson'};
  if (k === 'kml') return {protocol: 'omnivore:', filetype: 'kml'};
  if (k === 'gpx') return {protocol: 'omnivore:', filetype: 'gpx'};
  if (k === 'tilejson') return {protocol: 'tilejson:', filetype: 'tilejson'};
  if (k === 'tm2z') return {protocol: 'tm2z:', filetype: 'tm2z'};
  if (k.indexOf('serialtiles') === 0) return {protocol: 'serialtiles:', filetype: 'serialtiles'};
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
    console.log(validProtocols[i]);
    q.defer(validate.info, validProtocols[i].protocol + '//' + fixtures.valid[k]);
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
  validate.info('tilejson://' + fixtures.invalid.tilejson.bounds, function(err, info) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(info, 'no info returned');
    t.end();
  });
});

test('lib.validate.info: invalid metadata size', function(t) {
  validate.info('tilejson://' + fixtures.valid.tilejson, { max_metadata: 50 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, 'Metadata exceeds limit of 0.0k.', 'expected error message');
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
    var valid = sources.reduce(function(memo, source) {
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
  validate.info('tilejson://' + fixtures.invalid.tilejson.bounds, function(err, source) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(source, 'no source returned');
    t.end();
  });
});
