passnode
========

A passbook server implementation for nodejs

Based on [passbook-server](https://bitbucket.org/tetsuo/passbook-server).

# Basic Instructions

## Certificate Request

If you do not have a certificate for passes, then you need to follow these steps. If you do have MacOSX, then maybe it is better to follows [these instructions](http://developer.xtify.com/display/APIs/Creating+Your+Passbook+Certificate)

1. Create a private key and a certificate signing request for passes:
```
  openssl req -out request.csr -new -newkey rsa:2048 -nodes -keyout private.key
```

2. Go to the [Pass Types](https://developer.apple.com/account/ios/identifiers/passTypeId/passTypeIdList.action) section in your Apple's developer account and create a custom pass type, for example com.example.event

3. Go to the [Certificates](https://developer.apple.com/account/ios/certificate/certificateList.action) section and create a certificate using the passtype and the signing request generated in previous steps

4. Convert the certificate to pem format:
```
  openssl x509 -inform DER -in pass.cer -trustout -out pass.pem
```

5. Download the Apple's [WWDRCA certificate](http://developer.apple.com/certificationauthority/AppleWWDRCA.cer), and then convert it to pem format:
```
  openssl x509 -inform DER -in AppleWWDRCA.cer -trustout -out wwdr.pem
```

## Usage

1. To generate a passbook then you first need to create a template. You can just copy the folder of one of the examples from Apple's [Passbook Materials](https://developer.apple.com/downloads/index.action?name=passbook) to start.

1. Import the passnode module:
```
  var passnode = require('passnode');
```

1. Create the data for the pass. This follows the same format as the pass.json. All the variables defined here will OVERWRITE those from the pass.json file. Example:
```
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
```

1. Define the credentials. Use relatives or absolute paths.
```
  passnode.credentials('pass.pem','wwdr.pem','private.key',password,callback);
```

1. Load the template, and create the pass:
```
  passnode.load('../sampleTemplate', function(error, template){
    passnode.create(template, passdata, function(error, pkgdata){
      //now pkgdata is a buffer containing the zip data. You can do whatever you want with it.
    };
  };
```
