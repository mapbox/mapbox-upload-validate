var test = require('tape').test;
var fixtures = require('./fixtures');
var expected = require('./expected');
var tm2z = require('../lib/validate').tm2z;
var tilelive = require('tilelive');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

function validate(filepath, callback) {
  tilelive.load('tm2z://' + filepath, function(err, source) {
    if (err) throw err;
    source.getInfo(function(err, info) {
      if (err) throw(err);
      tm2z({
        filepath: filepath,
        protocol: 'tm2z:',
        info: info,
        source: source
      }, callback);
    });
  });
}

test('lib.validators.tm2z: valid', function(t) {
  console.log('please be patient while tm2z is profiled...');
  validate(fixtures.valid.tm2z, function(err) {
    t.ifError(err, 'does not error');
    t.end();
  });
});
