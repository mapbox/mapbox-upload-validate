// Tests operate against a specific api-maps
process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

require('./validate.test.js');
