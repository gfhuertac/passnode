var path = require('path');
var child = require('child_process');

KEY_DIR = '../keys/';

//
// manifest.jsonの署名を行う
//
exports.createSignature = function(manifest, options, callback) {
  // javascriptにはデフォルト引数がないのよ...
  if (typeof callback !== 'function') {
    callback = options;
    options = null;
  }

  var signer = null;
  var certfile = null;
  var keyfile = null;
  var passin = null;

  if (options) {
    signer = options['signer'] || path.resolve(KEY_DIR, 'pass.pem');
    certfile = options['certfile'] || path.resolve(KEY_DIR, 'wwdr.pem');
    keyfile = options['keyfile'];
    passin = options['passin'];
  } else {
    signer = path.resolve(KEY_DIR, 'pass.pem');
    certfile = path.resolve(KEY_DIR, 'wwdr.pem');
    keyfile = path.resolve(KEY_DIR, 'private.key');
    passin = 'pass:pass';
  }

  var args = [
    "smime",
    "-sign", "-binary",
    "-signer", signer,
    "-certfile", certfile,
    "-inkey", keyfile
  ];

  if (passin && passin.length > 0) {
    args.push("-passin", passin);
  }

  console.log(args.join(' '));

  var sign = child.execFile("openssl", args, { stdio: "pipe" }, function(error, stdout, stderr) {
    if (error) {

      callback(new Error(stderr));
    } else {
      var signature = stdout.split(/\n\n/)[3];
      callback(null, new Buffer(signature, "base64"));
    }
  });

  sign.stdin.write(manifest);
  sign.stdin.end();
}

