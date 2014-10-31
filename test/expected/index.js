var path = require('path');

module.exports = {
  info: {
    'geojson': require('./valid.geojson.info.json'),
    'gpx': require('./valid.gpx.info.json'),
    'kml': require('./valid.kml.info.json'),
    'shp': require('./valid.shp.info.json'),
    'tif': require('./valid.tif.info.json'),
    'tilejson': require('./valid.tilejson.info.json'),
    'tm2z': require('./valid.tm2z.info.json'),
    'serialtiles': require('./valid.serialtiles.info.json')
  }
};
