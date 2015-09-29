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
      q.defer(validateGdalAndSize, f, filetype);
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

  function validateGdalAndSize(file, filetype, callback){
    fs.stat(file, function(err, stats){
      if(err) return callback(err);
      var vectorfiles = ['csv','shp', 'kml', 'gpx', 'geojson', 'topojson'];
      if(vectorfiles.indexOf(filetype) < 0){ callback(null, stats); }
      var ds;
      try {
        ds = gdal.open(file);
      }
      catch(ex){
        return callback(ex);
      }
      //safety check: let gdal tell, if it also thinks, this is vector
      //check if vector data
      var driver = ds.driver;
      var driver_metadata = driver.getMetadata();
      if (driver_metadata.DCAP_VECTOR !== 'YES') {
        return callback(null, stats);
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
      callback(null, stats);
    });
  }

};

