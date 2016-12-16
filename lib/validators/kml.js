var gdal = require('gdal');

module.exports = kmlLayers;

function kmlLayers(infile) {

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
}

module.exports.max_layer_count = 15;
