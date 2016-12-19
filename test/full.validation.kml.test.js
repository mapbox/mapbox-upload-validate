var test = require('tape').test;
var path = require('path');
var kml = require('../lib/validators/kml.js');


var fixturePath = function (fixtureName) {
  return path.resolve(__dirname,'fixtures', fixtureName);
};

test('[kml] valid kml', function (assert) {
  var infile = (fixturePath('ok-layers-folders-emptygeometries.kml'));
    assert.equal(kml(infile), true, 'no error');
    assert.end();
  });

test('[kml] invalid duplicate layers', function (assert) {
  var infile = (fixturePath('invalid.kml-duplicate-layers.kml'));
    assert.equal(kml(infile), 'layers ' + kml.lyr_name + ' occurs ' + kml.lyr_name_cnt + ' times.', 'expected error message');
    assert.end();
});

test('[kml] invalid too many layers', function (assert) {
  var infile = (fixturePath('fail-more-than-15-layers.kml'));
    assert.ok(kml(infile), '22 layers found. Maximum of 15 layers allowed.', 'expected error message');
    assert.end();
});

test('[kml] invalid', function (assert) {
  var infile = (fixturePath('invalid.kml-fail.kml'));
    assert.equal(kml(infile), 'Error opening dataset', 'expected error message');
    assert.end();
});
