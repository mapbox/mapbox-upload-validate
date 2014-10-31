var path = require('path');
var datapath = path.dirname(require.resolve('mapnik-test-data'));

module.exports = {
  valid: {
    'geojson': path.join(datapath, 'data/geojson/DC_polygon.geo.json'),
    'gpx': path.join(datapath, 'data/gpx/fells_loop.gpx'),
    'kml': path.join(datapath, 'data/kml/1week_earthquake.kml'),
    // 'zip': path.join(__dirname, 'valid.shapefile.zip'),
    'shp': path.join(__dirname, 'valid.shapefile', 'valid.shapefile.shp'),
    'tif': path.join(datapath, 'data/geotiff/sample.tif'),
    'tilejson': path.join(__dirname, 'valid.tilejson'),
    'tm2z': path.join(__dirname, 'valid.tm2z'),
    'serialtiles': path.join(__dirname, 'valid.serialtiles.gz')
  },
  invalid: {
    'unsupported': path.join(__dirname, 'invalid.unsupported.txt'),
    'tilejson': path.join(__dirname, 'invalid.tilejson')
  }
};
