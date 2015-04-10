module.exports = {
  info: {
    'geojson': require('./valid.geojson.info.json'),
    'gpx': require('./valid.gpx.info.json'),
    'kml': require('./valid.kml.info.json'),
    'shp': require('./valid.shp.info.json'),
    'tif': require('./valid.tif.info.json'),
    'tilejson': require('./valid.tilejson.info.json'),
    'tm2z': require('./valid.tm2z.info.json'),
    'serialtiles': require('./valid.serialtiles.info.json'),
    'serialtiles_png': require('./valid.serialtiles_png.info.json'),
    'serialtiles_pbf': require('./valid.serialtiles_pbf.info.json'),
    'mbtiles-carmen2': require('./valid.mbtiles.carmen2.info.json'),
    'mbtiles-onlygrids': require('./valid.mbtiles.onlygrids.info.json'),
    'mbtiles-onlytiles': require('./valid.mbtiles.onlytiles.info.json'),
    'mbtiles-tilesgrids': require('./valid.mbtiles.tilesgrid.info.json'),
    'mbtiles-update1': require('./valid.mbtiles.update1.info.json'),
    'mbtiles-update2': require('./valid.mbtiles.update2.info.json'),
    'mbtiles-vector': require('./valid.mbtiles.vector.info.json'),
    'mbtiles-vectorgzip': require('./valid.mbtiles.vectorgzip.info.json'),
    'mbtiles-webp': require('./valid.mbtiles.webp.info.json')
  },
  tm2zErrors: {
    'doublezip': 'Unknown filetype',
    'empty': 'project.xml not found in package',
    'filesize': 'Upload size should not exceed 750KB.',
    'gunzipsize': 'Unzipped size should not exceed 5MB.',
    'malformed': 'expected < at line 1',
    'missingfont': 'Failed to find font face \'This Is A Missing Font\' in style \'country_label\' in TextSymbolizer',
    'missingimage': 'file could not be found: \'invalid.tm2z-missing-image.tm2z/img/ice.jpg\' in style \'water\' in PolygonPatternSymbolizer',
    'nodirectory': 'EISDIR, open \'invalid.tm2z-nodirectory.tm2z/\'',
    'xmlsize': 'Unzipped project.xml size should not exceed 750KB.',
    'metadatasize': 'Metadata exceeds limit of 0.0k.',
    'maxdrawtime': 'At least one tile exceeds the draw time limit of 1ms. Please optimize your styles.',
    'avgdrawtime': 'The average tile draw time exceeds the limit of 1ms. Please optimize your styles.',
    'maximgbytes': 'At least one rendered tile exceeds the file size limit of 0.0k. Try lowering the number of PNG colors or JPEG quality in your project settings.',
    'avgimgbytes': 'The average rendered tile exceeds the file size limit of 0.0k. Try lowering the number of PNG colors or JPEG quality in your project settings.'
  },
  tilejsonErrors: {
    'metadatasize': 'Metadata exceeds limit of 0.0k.',
    'bounds': 'bounds must be an array of the form [west, south, east, north]',
    'hostname': 'Invalid hostname in TileJSON'
  },
  serialtilesErrors: {
    'tilesize': 'Tile exceeds maximum size of 1k at z1. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.',
    'noinfo': 'Missing Info object',
    'cantdeserialize': 'DeserializationError: Invalid data',
    'tiletype': 'Invalid tiletype',
    'gzipped': 'DeserializationError: Invalid data'
  },
  omnivoreErrors: {
    'shpfilesize': 'File is larger than 1024 bytes. Too big to process.',
    'tiffilesize': 'File is larger than 1024 bytes. Too big to process.',
    'bad-projection': 'Invalid shapefile: invalid projection file',
    'scrambled-files': 'Unknown filetype',
    'bad-bounds': 'bounds east value must be between -360 and 360',
    'bad-tif': 'Unknown filetype'
  },
  mbtilesErrors: {
    'oldtemplate': 'Use TileMill 0.7 or later to export MBTiles with a valid template.',
    'notadb': 'Unknown filetype',
    'corrupt': '',
    'vector': 'Vector source must include "vector_layers" key',
    'oldcarmen': 'Carmen 0.1.x tilesets are no longer supported.',
    'empty': 'Tileset is empty.',
    'limits': 'Tileset exceeds processing limit.',
    'tiletoobig': 'Tile exceeds maximum size of 0k at z1. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.',
    'gridtoobig': 'Grid exceeds maximum size of 0k at z1. Reduce the detail of data at this zoom level or omit it by adjusting your minzoom.',
    'nulltile': 'Tile is invalid'
  },
  unsupportedErrors: 'Unknown filetype'
};
