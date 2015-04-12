Project Rhino
=========
####Distribute Encrypted File Storage - Made for dummies
#####Version 1.0

Imagine if Dropbox, OneDrive, and Google Drive were in one place and the only person that can access it is you. 

<p align="center">
  <img src="http://i.imgur.com/OubQNcJ.png?1"/>
</p>

Tech
--------------
The Rhino's journey begins at the user's computer, when they decide to upload a classified document to their cloud. The file will first get split into multiple parts on the user's computer, and then will be compressed using libz algorithm. Then, each part is encrypted using AES-256 encryption algorithm using a key and a salt that is generated and accessable by solely the user's computer. Next, the client program will transfer each encrypted part to our server which will then be sent to one of many cloud services (currently including dropbox, google drive, and Microsoft OneDrive!!!). We also have a web UI which would give the list of files the user has uploaded and the number of parts per file. The file can then be downloaded online and be reassembled using the user's private key and the client program we built.

Rhino uses a number of API's/Platforms to work properly:

- [Node.js] - Evented I/O for the backend
- [Express.js] - Framework used to build the REST-based backend
- [Meteor.js] - Build apps that use Node.js client-side and server-side
- [jQuery] - Obvious things are obvious 
- [C++] - Emotime library
- [OpenSSL] - THE name for encryption
- [Azure] - Some awesome VM's
- [libZ] - Compress things to GZip stream


Prerequisites
--------------
* [Node.js] - Tested with version v0.10.29
* [Meteor.js] - Tested with v0.9.4


Installation
--------------

```sh
git clone https://github.com/rkrishnan2012/HackDartmouth hackdartmouth
cd dartmouth
npm install
```

Starting the server
--------------
There are many parts to this stack to make an end to end system. Unfortunately, due to time constraints, we weren't able to write out the full deployment instructions. However, we will update this a few days after the hackathon.


License
--------------
MIT

[C++]:https://github.com/luca-m/emotime
[OpenSSL]:http://openssl.org
[libZ]:http://www.zlib.net/
[jQuery]:http://jquery.com
[Node.js]:http://nodejs.org
[Express.js]:http://expressjs.com
[Meteor.js]:http://meteor.com
[Azure]:http://azure.microsoft.com/
