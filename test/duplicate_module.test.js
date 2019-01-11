var exec = require('child_process').exec;
var test = require('tape').test;

var count_module = function(name,callback) {
  var cmd = 'npm ls ' + name;
  exec(cmd,
    function (error, stdout) {
      var pattern = new RegExp(name+'@.+ ','g');
      var match = stdout.match(pattern);
      if (!match) {
        return callback(null,0);
      }
      // filter matching versions
      var uniqueVersions = [];
      for(var i = 0; i < match.length; i++) {
        var version = match[i].split('@')[1].trim();
        if(uniqueVersions.indexOf(version) === -1) {
          uniqueVersions.push(version);
        }
      }
      return callback(null,uniqueVersions.length);
  });
};
['mapnik', 'tilelive'].forEach(function(mod) {
  test('Duplicate modules: there should only be one ' + mod + ' otherwise you are asking for pwnage', function(t) {
    count_module(mod, function(err,count) {
      if (err) throw err;
      if (count !== undefined && count > 0) {
          t.equal(count,1,'you have more than one copy of ' + mod + ' (`npm ls ' + mod + '`)');
      }
      t.end();
    });
  });
});
