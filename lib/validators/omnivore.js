var fs = require('fs');
var uploadLimits = require('mapbox-upload-limits');
var prettyBytes = require('pretty-bytes');
var path = require('path');
var queue = require('queue-async');
var invalid = require('../invalid');
var sniffer = require('mapbox-file-sniff');
var gdal = require('gdal');

module.exports = function validateOmnivore(opts, callback) {
  var dir = path.dirname(opts.filepath);
  var ext = path.extname(opts.filepath);
  var base = path.basename(opts.filepath, ext);
  var limits;

  var files = ext === '.shp' ?
    [ opts.filepath, path.join(dir, base + '.dbf') ] :
    [ opts.filepath ];

  sniffer.quaff(opts.filepath, function(err, filetype) {
    if (err) return callback(err);

    if (filetype === 'tif') limits = opts.limits || uploadLimits.tif;
    else if (filetype === 'csv') limits = opts.limits || uploadLimits.csv;
    else limits = opts.limits || uploadLimits.omnivoreOther;

    var q = queue();
    files.forEach(function(f) {
      q.defer(validateGdalAndSize, f);
    });
    q.awaitAll(function(err, stats) {
      if (err) return callback(err);

      var size = stats.reduce(function(memo, stat) {
        memo += stat.size;
        return memo;
      }, 0);

      if (size > limits.max_filesize) {
        return callback(invalid('File is larger than ' + prettyBytes(limits.max_filesize) + '. Too big to process.'));
      }
      callback();
    });
  });
};

function validateGdalAndSize(file, callback){
  fs.stat(file, function(err, stats){
    if(err) return callback(err);
    try {
      var ds = gdal.open(file, mode='r');
    }
    catch(ex){
      return callback(ex);
    }
    var driver = ds.driver;
    var driver_metadata = driver.getMetadata();
    //check if vector data
    if (driver_metadata['DCAP_VECTOR'] !== 'YES') {
      return callback(null, stats);
    }
    ds.layers.forEach(function(lyr){
        lyr.features.forEach(function(feat){
            if(!feat.getGeometry().isValid()){
              var msg;
              if(gdal.lastError && gdal.lastError.message){
                msg = gdal.lastError.message;
              } else {
                msg = 'No error message available';
              }
              return callback(msg);
            }
        });
    });
    callback(null, stats);
  });
}
