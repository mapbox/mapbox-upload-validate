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

  //always keep original file name as first in array: expected by gdal validation
  var files = ext === '.shp' ?
    [ opts.filepath, path.join(dir, base + '.dbf') ] :
    [ opts.filepath ];

  sniffer.quaff(opts.filepath, function(err, filetype) {
    if (err) return callback(err);

    if (filetype === 'tif') limits = opts.limits || uploadLimits.tif;
    else if (filetype === 'csv') limits = opts.limits || uploadLimits.csv;
    else limits = opts.limits || uploadLimits.omnivoreOther;

    var q = queue();
    //do file size test first
    files.forEach(function(f) {
      q.defer(fs.stat.bind(fs), f);
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
      //only look at files that passed above file size test
      var vectorfiles = ['csv','shp', 'kml', 'gpx', 'geojson', 'topojson'];
      //skip non-vector files
      if(vectorfiles.indexOf(filetype) < 0){
        callback();
      }
      return validateGdal(files[0], callback);
    });
  });

  function validateGdal(file, callback){
    var ds;
    try {
      ds = gdal.open(file);
    }
    catch(ex){
      return callback(ex);
    }
    //safety check: let gdal tell, if it also thinks, this is vector
    var driver = ds.driver;
    var driver_metadata = driver.getMetadata();
    if (driver_metadata.DCAP_VECTOR !== 'YES') {
      return callback();
    }
    ds.layers.forEach(function(lyr){
        lyr.features.forEach(function(feat){
          var geom = feat.getGeometry();
          //null geometries are valid, continue foreach loop
          if(null === geom){ return true; }
          try{
            if(!geom.isValid()){
              var msg;
              if(gdal.lastError && gdal.lastError.message){
                msg = gdal.lastError.message;
              } else {
                msg = 'No error message available';
              }
              return callback(msg);
            }
          } catch(ex){
            return callback(ex.message);
          }
        });
    });
    callback();
  }

};

