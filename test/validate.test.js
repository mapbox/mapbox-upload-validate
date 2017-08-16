var test = require('tape').test;
var validate = require('../lib/validate');
var fixtures = require('./fixtures');
var expected = require('./expected');
var queue = require('queue-async');
var testUtils = require('./util');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

var validFiletypes = Object.keys(fixtures.valid);
var validProtocols = validFiletypes.map(createValidProtocols);

function createValidProtocols(string) {
  if (string.indexOf('mbtiles') === 0) return {protocol: 'mbtiles:', filetype: 'mbtiles'};
  if (string === 'csv') return {protocol: 'omnivore:', filetype: 'csv'};
  if (string === 'shp') return {protocol: 'omnivore:', filetype: 'shp'};
  if (string === 'tif') return {protocol: 'omnivore:', filetype: 'tif'};
  if (string === 'geojson') return {protocol: 'omnivore:', filetype: 'geojson'};
  if (string === 'kml') return {protocol: 'omnivore:', filetype: 'kml'};
  if (string === 'gpx') return {protocol: 'omnivore:', filetype: 'gpx'};
  if (string === 'tilejson') return {protocol: 'tilejson:', filetype: 'tilejson'};
  if (string === 'tm2z') return {protocol: 'tm2z:', filetype: 'tm2z'};
  if (string.indexOf('serialtiles') === 0) return {protocol: 'serialtiles:', filetype: 'serialtiles'};
}

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
    var fileinfo = createValidProtocols(k);
    var info = {
      uri: validProtocols[i].protocol + '//' + fixtures.valid[k],
      filetype: fileinfo.filetype,
      protocol: validProtocols[i].protocol,
      filepath: fixtures.valid[k]
    };
    q.defer(validate.info, info);
  });
  q.awaitAll(function(err, infos) {
    t.ifError(err, 'does not error on valid files');
    infos = infos.map(testUtils.infoTruncator);
    t.deepEqual(infos, expectedInfos, 'expected info returned');
    t.end();
  });
});

test('lib.validate.info: unsupported file', function(t) {
  var info = {
    uri: 'nonsense://' + fixtures.invalid.unsupported,
    filetype: 'txt',
    protocol: 'nonsense:',
    filepath: fixtures.invalid.unsupported
  };
  validate.info(info, function(err, info) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(info, 'no info returned');
    t.end();
  });
});

test('lib.validate.info: invalid data in the file', function(t) {
  var info = {
    uri: 'tilejson://' + fixtures.invalid.tilejson.bounds,
    filetype: 'tilejson',
    protocol: 'tilejson:',
    filepath: fixtures.invalid.tilejson.bounds
  };
  validate.info(info, function(err, info) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(info, 'no info returned');
    t.end();
  });
});

test('lib.validate.info: invalid metadata size', function(t) {
  var info = {
    uri: 'tilejson://' + fixtures.valid.tilejson,
    filetype: 'tilejson',
    protocol: 'tilejson:',
    filepath: fixtures.valid.tilejson
  };
  validate.info(info, { max_metadata: 50 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, 'Metadata exceeds limit of 0.0k.', 'expected error message');
    t.end();
  });
});

test('lib.validate.info: valid metadata size when pre-generated tilestats object exists in mbtiles', function(t) {
  var info = {
    uri: 'mbtiles://' + fixtures.valid['mbtiles-tilestats'],
    filetype: 'mbtiles',
    protocol: 'mbtiles:',
    filepath: fixtures.valid['mbtiles-tilestats']
  };

  // full length of metadata table without tilestats is 509 
  validate.info(info, { max_metadata: 509 }, function(err, info) {
    t.notOk(err, 'no error');
    t.deepEqual(info, expected.info['mbtiles-tilestats'], 'info is equal');
    t.end();
  });
});

test('lib.validate.source: valid', function(t) {
  var q = queue();
  validFiletypes.forEach(function(k, i) {
    q.defer(validate.source, validProtocols[i].protocol + '//' + fixtures.valid[k]);
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
  validate.source('nonsense://' + fixtures.invalid.unsupported, function(err, source) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(source, 'no source returned');
    t.end();
  });
});

test('lib.validate.source: invalid data in the file', function(t) {
  //'tilejson://' + fixtures.invalid.tilejson.bounds
  var info = {
    uri: 'tilejson://' + fixtures.invalid.tilejson.bounds,
    filetype: 'tilejson',
    protocol: 'tilejson:',
    filepath: fixtures.invalid.tilejson.bounds
  };
  validate.info(info, function(err, source) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(source, 'no source returned');
    t.end();
  });
});
