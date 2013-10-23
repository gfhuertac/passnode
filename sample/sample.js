process.on('uncaughtException', function(err) {
  console.log(err.stack);
});

var passnode = require('../index.js');

var passdata = {
  "eventTicket" : {
    "primaryFields" : [
      {
        "key" : "event",
        "label" : "EVENT",
        "value" : "The Beat Goes On"
      }
    ],
  "secondaryFields" : [
      {
        "key" : "loc",
        "label" : "LOCATION",
        "value" : "Moscone West"
      }
    ]
  }
};

console.log('Starting...');
passnode.credentials('../keys/pass.pem','../keys/wwdr.pem','../keys/private.key',undefined, function(error){
  if (error) {
    console.log('Error loading the credentials ' + error);
    return;
  }
  console.log('Credentials loaded!');
  passnode.load('../sampleTemplate', function(error, template){
    if (error) {
      console.log('Error loading the template ' + error);
      return;
    }
    console.log('Template loaded!');
    passnode.create(template, passdata, function(error, pkgdata){
      if (error) {
        console.log('Error creating the package ' + error);
        return;
      }
//      console.log(pkgdata);
//      return;
      passnode.save(pkgdata, 'sample.pkpass', function(error){
        if (error) {
          console.log('Error saving the file ' + error);
        } else {
          console.log('Package created successfully!');
        }
      });
    });
  });
});
