var gdal = require('gdal');

module.exports = kmlLayers;

function kmlLayers(infile) {

  var ds_kml = {};
  var lyr_cnt = 0;
  var msg = [];

  function layername_count(ds) {
    var lyr_name_cnt = {};
    var dupes = {};
    ds.layers.forEach(function(lyr) {
      var lyr_name = lyr.name;
      if (lyr_name in lyr_name_cnt) {
        lyr_name_cnt[lyr_name]++;
        dupes[lyr_name] = lyr_name_cnt[lyr_name];
      } else {
        lyr_name_cnt[lyr_name] = 1;
      }
    });
    return dupes;
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
  if (Object.keys(duplicate_lyr_msg).length > 0) {
    ds_kml.close();
    for(key in duplicate_lyr_msg) {
      msg += ' ' + key + ' (' + duplicate_lyr_msg[key] + ')';
    }
    return 'Duplicate layer names:' + msg;
    console.log(msg);
  }
  return true;
}

module.exports.max_layer_count = 15;
