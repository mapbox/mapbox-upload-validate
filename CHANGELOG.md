## 3.7.2

* Add namespaced onivores and add z23 bump

## 3.7.1

* Add tests for updated KML validation from 3.7.0.

## 3.7.0

* Add KML validation prior to passing into mapnik/gdal drivers to prevent burning computers

## 3.6.0

* Upgrade mapnik-omnivore#8.1.0, tilelive-omnivore@3.1.0, mapbox-file-sniff@0.5.2, mbtiles@0.9.0

## 3.5.1

* tilelive-omnivore@3.0.0, mapnik-omnivore@8.0.0

## 3.5.0

* Add validation for # of KML layers

## 3.4.0

* Upgraded to tilelive-omnivore@2.4.0

## 3.3.0

* Updated to use mapnik 3.5.0
* Updated to tilelive 5.12.0
* Removed the use of `parse()` within mapnik.
* Changed vector tile validation as part of mapnik 3.5.0, now will error on more common vector tile issues.

## 3.1.0

* Upgraded to tilelive-omnivore@2.1.0

## 3.0.0

* Upgraded to tilelive-omnivore@2.0.0

## 2.7.0

* Refactored serialtiles validation, allows full validation of vector tiles to be skipped via environment variable

## 2.6.9

* Updates `node-tilejson` dependency in order to support node v0.12.x

## 2.6.8

* Fixes an error causing tiff size to be improperly restricted

## 2.6.7

* Use [mapbox-upload-limits](https://github.com/mapbox/mapbox-upload-limits) to
  centralize upload limits
