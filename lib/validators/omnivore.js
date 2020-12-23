/* jshint esversion: 6 */
'use strict';

const fs = require('fs');
const uploadLimits = require('mapbox-upload-limits');
const prettyBytes = require('pretty-bytes');
const path = require('path');
const queue = require('queue-async');
const invalid = require('../invalid');
const sniffer = require('@mapbox/mapbox-file-sniff');
const getMetadata = require('@mapbox/mapnik-omnivore').digest;

module.exports = function validateOmnivore(opts, callback) {
  const dir = path.dirname(opts.filepath);
  const ext = path.extname(opts.filepath);
  const base = path.basename(opts.filepath, ext);
  let limits;

  const files = ext === '.shp' ?
    [opts.filepath, path.join(dir, base + '.dbf')] :
    [opts.filepath];

  sniffer.fromFile(opts.filepath, (err, fileinfo) => {
    if (err) return callback(err);

    if (fileinfo.type === 'tif') limits = opts.limits || uploadLimits.tif;
    else if (fileinfo.type === 'csv') limits = opts.limits || uploadLimits.csv;
    else if (fileinfo.type === 'geojson') limits = opts.limits || uploadLimits.geojson;
    else if (fileinfo.type === 'kml') limits = opts.limits || uploadLimits.kml;
    else limits = opts.limits || uploadLimits.omnivoreOther;

    getMetadata(opts.filepath, (err, metadata) => {
      if (err) return callback(err);
      // Stopgap while only 8 bit TIFFs are supported
      if (fileinfo.type === 'kml') {
        const layers = metadata.layers.length;
        if (layers > uploadLimits.kml.layers) {
          return callback(invalid('%d layers found. Maximum of %d layers allowed.', layers, uploadLimits.kml.layers));
        }
      }

      const q = queue();
      files.forEach((f) => {
        q.defer(fs.stat.bind(fs), f);
      });
      q.awaitAll((err, stats) => {
        if (err) return callback(err);

        const size = stats.reduce((memo, stat) => {
          memo += stat.size;
          return memo;
        }, 0);

        if (size > limits.max_filesize) {
          return callback(invalid('File is larger than ' + prettyBytes(limits.max_filesize) + '. Too big to process.'));
        }
        callback();
      });
    });
  });
};
