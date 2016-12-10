var test = require('tape').test;
var validate = require('../lib/validate');
var fixtures = require('./fixtures');

process.env.MapboxAPIMaps = 'https://api.tiles.mapbox.com';

test('lib.validate.filepath: unsupported file', function(t) {
  validate(fixtures.invalid.unsupported, function(err, protocol) {
    t.ok(err, 'expected error');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.notOk(protocol, 'no protocol returned');
    t.end();
  });
});
