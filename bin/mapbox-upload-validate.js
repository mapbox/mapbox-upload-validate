#!/usr/bin/env node

var validate = require('..');
var mapnik = require('mapnik');
var path = require('path');

// silence logs
mapnik.Logger.setSeverity(mapnik.Logger.NONE);

process.env.MapboxAPIMaps = process.env.MapboxAPIMaps || 'https://api.tiles.mapbox.com';

var filepath = path.resolve(process.argv[2]);

validate(filepath, function(err, valid, message) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (!valid) {
    console.error(message);
    process.exit(3);
  }

  console.log(filepath);
  process.exit(0);
});
