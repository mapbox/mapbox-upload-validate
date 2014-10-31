# Work in progress

That is to say, this doesn't work yet.

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

Will `exit 1` if invalid, and send an error message to stderr. Otherwise will send `valid` to stdout and `exit 0`.

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
- `MapboxAPIMaps`: url for mapbox tile api
- `MapboxAccessToken`: for access to mapbox.com

Then

```
npm test
```

## Gotchas
- Do we need an env var for `MapboxAPIMaps` endpoint?
- tilelive in package.json needs to match version with that of tilelive-vector
- studio-pro, tm2-private fonts
- parsing entire serialtiles file to find info: worth it?
