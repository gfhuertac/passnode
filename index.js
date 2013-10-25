var archiver = require('archiver');
var BufferStream = require('bufferstream')
var fs = require('fs');
var util = require('util');
var uuid = require('node-uuid');

var man = require('./lib/manifest');
var sig = require('./lib/signature');
var template = require('./lib/template');

var options = {};

var merge = function(obj1, obj2) {
  for( var p in obj2 )
    if( obj1.hasOwnProperty(p) )
      if( Object.prototype.toString.call( obj2[p] ) === '[object Array]' ) {
        if( Object.prototype.toString.call( obj1[p] ) === '[object Array]' ) {
          obj1[p] = obj1[p].concat(obj2[p]);
        } else {
          obj1[p] = obj2[p];
        }
      } else if (typeof obj2[p] === 'object') {
        obj1[p] = merge(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
  return obj1;
};

var zipFile = function(zip, name, buffer, callback) {
  // Initialize stream
  var rsb = new streamBuffers.ReadableStreamBuffer({
    frequency: 10,
    chunkSize: 4096
  }); 
  rsb.put(buffer);
  zip.addFile(rsb, { name: name }, callback);
};

/**
* Loads a template from the specified location.
* A template consists on a mandatory pass.json file, with the structure of the template
* and a set of images that will be used for logo, backrground, etc.
* See Apple's passbook documentation for details on the images.
*
* @method loadTemplate
* @param {String} templateLocation The location of the template to load
* @param {Function} callback A callback function to be called after the loading operation
*/
var loadTemplate = function(templateLocation, callback) {
  template.readTemplate(templateLocation, callback);
};

/**
* Creates a passbook using a template and custom data.
*
* @method createPassbook
* @param {String} contents The contents of the template loaded using the load method
* @param {String} data The custom data that will replace that from the template
* @param {String} type The output format for the passbook (base64, string for binary, etc. See http://stuk.github.io/jszip/)
* @param {Function} callback A callback function to be called after the creation operation
*/
var createPassbook = function(contents, data, callback) {
  var pass = JSON.parse(contents['pass.json'].toString('utf8'));
  //pass['serialNumber'] = uuid.v4();
  merge(pass, data);
  contents['pass.json'] = new Buffer(JSON.stringify(pass), 'utf8');

  var zip = archiver('zip');
  var output = new BufferStream({encoding:'utf8', size:'flexible'});

  zip.on('error', callback);
  output.on('close', function() {
    console.log('Done zipping file');
    callback(undefined, output.buffer);
  });

  zip.pipe(output);

  for (var name in contents) {
    zip.append(contents[name], {name: name});
  }

  var manifest = JSON.stringify(man.createManifest(contents));
  zip.append(new Buffer(manifest), {name:'manifest.json'});

  sig.createSignature(manifest, options, function(error, signature) {
    if (error) {
      callback(error);
    } else {
      var sigfile = fs.createReadStream(signature);
      zip.append(sigfile,{name:'signature'}); //new Buffer(signature.toString(),'binary')
      zip.finalize(function(error, bytes){
        if (error) {
          callback(error);
        }
        fs.unlinkSync(signature);
      });
    }
  });
};

var saveToFile = function(zipdata, target, callback) {
  var ws = fs.createWriteStream(target);
  ws.write(zipdata, callback);
};

var setCredentials = function(passCertificate, appleCertificate, privateKey, password, callback) {
  if (!fs.existsSync(passCertificate)) {
    callback(new Error('Invalid pass certificate path'));
    return;
  }
  if (!fs.existsSync(appleCertificate)) {
    callback(new Error('Invalid pass certificate path'));
    return;
  }
  if (!fs.existsSync(privateKey)) {
    callback(new Error('Invalid pass certificate path'));
    return;
  }
  options.signer = passCertificate;
  options.certfile = appleCertificate;
  options.keyfile = privateKey;
  options.passin = password;
  callback(undefined);
};

exports.credentials = setCredentials;
exports.load = loadTemplate;
exports.create = createPassbook;
exports.save = saveToFile;