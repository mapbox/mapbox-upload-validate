[![Build Status](https://travis-ci.org/mapbox/mapbox-upload-validate.svg?branch=master)](https://travis-ci.org/mapbox/mapbox-upload-validate)

# mapbox-upload-validate

Validate that a file can be uploaded to Mapbox


## Install

```sh
$ npm install -g mapbox-upload-validate
```

## Usage

```sh
$ mapbox-upload-validate /path/to/data/file
```

Where `/path/to/data/file` is the path to a file.

There are three possible results:
- **Valid**: process exit 0 and logs the file's path to stdout
- **Invalid**: process exit 3, nothing is logged to stdout, and a validation error is printed to stderr
- **Unexpected**: something unexpected happened and we could not confirm whether or not the file is valid. Process exit 1 with nothing printed to stdout and an error message printed to stderr

The following types of files are supported for upload to Mapbox.com:
- Mbtiles
- GeoTIFF
- Zipped Shapefile
- GeoJSON
- TopoJSON
- GPX
- KML
- TileJSON
- tm2z
- Serialtiles

## Run tests

Setup your environment with some variables:
- `MapboxAccessToken`: for access to mapbox.com

Then

```
npm test
```
