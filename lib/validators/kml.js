var gdal = require('gdal');

module.exports = function (infile) {

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
