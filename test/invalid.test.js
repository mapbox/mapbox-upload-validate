var invalid = require('../lib/invalid');
var test = require('tape').test;

test('lib.invalid', function(t) {
  var msg = 'some error message';
  var err = invalid(msg);
  t.ok(err instanceof Error, 'returns an error');
  t.equal(err.message, msg, 'returns expected error message');
  t.equal(err.code, 'EINVALID', 'returns expected error code');

  msg = new Error(msg);
  msg.stack = 'stack trace';
  err = invalid(msg);
  t.ok(err instanceof Error, 'returns an error');
  t.equal(err.message, msg.message, 'returns expected error message');
  t.equal(err.code, 'EINVALID', 'returns expected error code');
  t.equal(err.stack, msg.stack, 'returns stack trace');

  t.end();
});
