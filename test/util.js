module.exports.infoTruncator = function(info) {
  var digits = 6;

  function truncate(num) {
    return Math.floor(num * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  if (info.bounds) info.bounds = info.bounds.map(truncate);
  if (info.center) info.center = info.center.map(truncate);

  return info;
};
