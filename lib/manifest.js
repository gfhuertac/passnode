var crypto = require('crypto');

HASH_ALGO = 'sha1';
HASH_FORMAT = 'hex';

//
// contentsはObject(Map)を想定
//
exports.createManifest = function(contents) {
  var manifestHash = {};

  for (var name in contents) {
    // SHA1 ハッシュの計算
    var sha1sum = crypto.createHash(HASH_ALGO);
    sha1sum.update(contents[name]);
    manifestHash[name] = sha1sum.digest(HASH_FORMAT);
  }

  return manifestHash;
}

