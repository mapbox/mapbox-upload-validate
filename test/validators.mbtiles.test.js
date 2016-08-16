var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var mbtiles = require('../lib/validate').mbtiles;
var tilelive = require('tilelive');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, limits, callback) {
  if (!callback) {
    callback = limits;
    limits = null;
  }

  tilelive.load('mbtiles://' + filepath, function(err, source) {
    if (err) throw err;

    source.getInfo(function(err, info) {
      if (err) throw err;

      var opts = {
        filepath: filepath,
        protocol: 'mbtiles:',
        info: info,
        source: source
      };
      if (limits) opts.limits = limits;
      mbtiles(opts, callback);
    });
  });
}

test('lib.validators.mbtiles: old mbtiles template', function(t) {
  validate(fixtures.invalid.mbtiles.oldtemplate, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.oldtemplate, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: unknown tile type', function(t) {
  t.end();
});

test('lib.validators.mbtiles: no vector_layers', function(t) {
  validate(fixtures.invalid.mbtiles.vector, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.vector, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: deprecated carmen data', function(t) {
  validate(fixtures.invalid.mbtiles.oldcarmen, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.oldcarmen, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: no tiles or grids', function(t) {
  validate(fixtures.invalid.mbtiles.empty, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.empty, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: too many tiles + grids', function(t) {
  validate(fixtures.invalid.mbtiles.limits, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.limits, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: null tile', function(t) {
  validate(fixtures.invalid.mbtiles.nulltile, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.nulltile, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: no tile_data column', function(t) {
  validate(fixtures.invalid.mbtiles.nocolumn, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.nulltile, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: tile too big', function(t) {
  validate(fixtures.valid['mbtiles-onlytiles'], { max_tilesize: 500 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.tiletoobig, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: grid too big', function(t) {
  validate(fixtures.valid['mbtiles-onlygrids'], { max_gridsize: 1 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.gridtoobig, 'expected error message');
    t.end();
  });
});

test('lib.validators.mbtiles: file too big', function(t) {
  validate(fixtures.valid['mbtiles-onlygrids'], { max_filesize: 1024 }, function(err) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.equal(err.message, expected.mbtilesErrors.filetoobig, 'expected error message');
    t.end();
  });
});

