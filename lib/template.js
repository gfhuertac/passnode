var fs = require('fs');
var path = require('path');

var templateCache = {};

exports.readTemplate = function(templateDir, callback) {
  if (templateCache[templateDir]) {
    callback(null, templateCache[templateDir]);
    return;
  }

  fs.readdir(templateDir, function(err, files) {
    if (err) {
      callback(err, null);
    } else {
      var contents = {};
      files.forEach(function(file) {
        contents[file] = fs.readFileSync(templateDir + '/' + file);
      });
      templateCache[templateDir] = contents;
      callback(null, contents);
    }
  });
};

