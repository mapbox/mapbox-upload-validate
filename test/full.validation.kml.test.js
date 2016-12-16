var test = require('tape').test;
var fixtures = require('./fixtures');
var validate = require('..');
var path = require('path');
var os = require('os');
var fs = require('fs');
var kml = require('../lib/validators/kml.js');


var fixturePath = function (fixtureName) {
  return path.resolve(__dirname, 'fixtures');
};

var kmlLayers = function (infile) {

  var ds_kml = '';
  var lyr_cnt = '';

  function layername_count(ds) {
    var lyr_name_cnt = {};
    ds.layers.forEach(function(lyr) {
      var lyr_name = lyr.name;
      if (lyr_name in lyr_name_cnt) {
        lyr_name_cnt[lyr_name]++;
      } else {
        lyr_name_cnt[lyr_name] = 1;
      }
    });
  }

  try {
    ds_kml = gdal.open(infile);
    lyr_cnt = ds_kml.layers.count();
  } catch (err) {
    return err.message;
  }

  if (lyr_cnt < 1) {
    ds_kml.close();
    return 'KML does not contain any layers.';
  }

  if (lyr_cnt > module.exports.max_layer_count) {
    ds_kml.close();
    return lyr_cnt + ' layers found. Maximum of ' + module.exports.max_layer_count + ' layers allowed.';
  }

  var duplicate_lyr_msg = layername_count(ds_kml);
  if (duplicate_lyr_msg) {
    ds_kml.close();
    return 'No duplicate layers allowed.';
  }

  return true;
};

test('[kml] valid kml', function (assert) {
  var infile = (fixturePath('invalid.kml-duplicate-layers.kml'));

  kmlLayers(infile, function(err) {
    assert.equal(null, err.message);
  });
  assert.end();
});

test('[kml] invalid duplicate layers', function (assert) {
  var infile = (fixturePath('invalid.kml-duplicate-layers.kml'));

  kmlLayers(infile, function(err) {
      assert.equal(err.message, 'Duplicate layer names: \'duplicate layer name\' found 2 times, \'layer 2\' found 2 times', 'expected error message');
      assert.equal(err, duplicate_lyr_msg, 'too many layers');
      assert.end();
    });
  });

test.only('[kml] invalid excess layers', function (assert) {
  var infile = (fixturePath('fail-more-than-15-layers.kml'));
  console.log('hello, are we getting here?');
    kml(infile, '22', function(err) {
      console.log(err);
      assert.ok(err, 'error properly handled');
      console.log('how about here?');
      assert.equal(err.message, '22 layers found. Maximum of 15 layers allowed');
      console.log('maybe here');
      assert.end(err);
    });
});

test('[kml] invalid', function (assert) {

});
