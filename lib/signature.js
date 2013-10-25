var child = require('child_process');
var os = require('os'); 
var path = require('path');
var uuid = require('node-uuid');

TEMP_DIR = '/tmp';
if (typeof os.tmpDir == 'function') {
  TEMP_DIR = os.tmpDir();
} else if (typeof os.tmpdir == 'function') {
  TEMP_DIR = os.tmpdir();
}
KEY_DIR = '../keys/';

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

  var target = path.resolve(TEMP_DIR, uuid.v1());

  var args = [
    "smime"
    ,"-binary"
    ,"-sign"
    ,"-certfile", certfile
    ,"-signer", signer
    ,"-inkey", keyfile
    ,"-out", target
    ,"-outform", "DER"
  ];

  if (passin && passin.length > 0) {
    args.push("-passin", passin);
  }

  var sign = child.execFile("openssl", args, { stdio: "pipe" }, function(error, stdout, stderr) {
    if (error) {
      callback(new Error(stderr));
    } else {
      //var signature = stdout;//.split(/\n\n/)[3];
      //callback(null, new Buffer(signature,'binary'));//, "base64"));
      callback(null, target);
    }
  });

  sign.stdin.write(manifest);
  sign.stdin.end();
}

