var path = require('path');
var datapath = path.dirname(require.resolve('mapnik-test-data'));

module.exports = {
  valid: {
    // 'zip': path.join(__dirname, 'valid.shapefile.zip'),
    'geojson': path.join(datapath, 'data/geojson/DC_polygon.geo.json'),
    'gpx': path.join(datapath, 'data/gpx/fells_loop.gpx'),
    'kml': path.join(datapath, 'data/kml/1week_earthquake.kml'),
    'shp': path.join(__dirname, 'valid.shapefile', 'valid.shapefile.shp'),
    'tif': path.join(datapath, 'data/geotiff/sample.tif'),
    'tilejson': path.join(__dirname, 'valid.tilejson'),
    'tm2z': path.join(__dirname, 'valid.tm2z'),
    'serialtiles': path.join(__dirname, 'valid.serialtiles.gz'),
    'mbtiles-carmen2': path.join(__dirname, 'valid-carmen2.mbtiles'),
    'mbtiles-onlygrids': path.join(__dirname, 'valid-onlygrids.mbtiles'),
    'mbtiles-onlytiles': path.join(__dirname, 'valid-onlytiles.mbtiles'),
    'mbtiles-tilesgrids': path.join(__dirname, 'valid-tilesgrid.mbtiles'),
    'mbtiles-update1': path.join(__dirname, 'valid-update1.mbtiles'),
    'mbtiles-update2': path.join(__dirname, 'valid-update2.mbtiles'),
    'mbtiles-vector': path.join(__dirname, 'valid-vector.mbtiles'),
    'mbtiles-vectorgzip': path.join(__dirname, 'valid-vectorgzip.mbtiles'),
    'mbtiles-webp': path.join(__dirname, 'valid-webp.mbtiles')
  },
  invalid: {
    'unsupported': path.join(__dirname, 'invalid.unsupported.txt'),
    'tilejson': {
      'bounds': path.join(__dirname, 'invalid.tilejson-bounds.tilejson'),
      'hostname': path.join(__dirname, 'invalid.tilejson-hostname.tilejson')
    },
    'tm2z': {
      'doublezip': path.join(__dirname, 'invalid.tm2z-doublezip.tm2z'),
      'empty': path.join(__dirname, 'invalid.tm2z-empty.tm2z'),
      'filesize': path.join(__dirname, 'invalid.tm2z-filesize.tm2z'),
      'gunzipsize': path.join(__dirname, 'invalid.tm2z-gunzipsize.tm2z'),
      'malformed': path.join(__dirname, 'invalid.tm2z-malformed.tm2z'),
      'missingfont': path.join(__dirname, 'invalid.tm2z-missing-font.tm2z'),
      'missingimage': path.join(__dirname, 'invalid.tm2z-missing-image.tm2z'),
      'nodirectory': path.join(__dirname, 'invalid.tm2z-nodirectory.tm2z'),
      'xmlsize': path.join(__dirname, 'invalid.tm2z-xmlsize.tm2z')
    },
    'serialtiles': {
      'noinfo': path.join(__dirname, 'invalid.serialtiles.noinfo.gz'),
      'tiletype': path.join(__dirname, 'invalid.serialtiles.tiletype.gz'),
      'ungzipped': path.join(__dirname, 'invalid.serialtiles.ungzipped.gz')
    },
    'omnivore': {
      'bad-projection': path.join(__dirname, 'invalid.omnivore.bad-projection', 'invalid.omnivore.bad-projection.shp'),
      'scrambled-files': path.join(__dirname, 'invalid.omnivore.scrambled-files', 'missing_type.shp'),
      'bad-bounds': path.join(__dirname, 'invalid.omnivore.geojson-bounds.json'),
      'bad-tif': path.join(__dirname, 'invalid.omnivore.tif')
    },
    'mbtiles': {
      'oldtemplate': path.join(__dirname, 'invalid.mbtiles-template.mbtiles'),
      'notadb': path.join(__dirname, 'invalid.mbtiles-notadb.mbtiles'),
      'vector': path.join(__dirname, 'invalid.mbtiles-vector.mbtiles'),
      'oldcarmen': path.join(__dirname, 'invalid.mbtiles-oldcarmen.mbtiles'),
      'empty': path.join(__dirname, 'invalid.mbtiles-empty.mbtiles'),
      'limits': path.join(__dirname, 'invalid.mbtiles-limits.mbtiles'),
      'nulltile': path.join(__dirname, 'invalid.mbtiles-null-tile.mbtiles')
    }
  }
};
