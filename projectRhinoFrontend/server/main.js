FileTable = new Meteor.Collection('fileTable');

Meteor.startup(function() {
    SSLProxy({
       port: 443, //or 443 (normal port/requires sudo)
       ssl : {
            key: Assets.getText("server.key"),
            cert: Assets.getText("server.crt"),

            //Optional CA
            //Assets.getText("ca.pem")
       }
    });
});

Router.map(function() {
    //  This will map to the user uploading a profile picture
    this.route('/upload/file', {
        //  Only execute this on the server (precautionary)
        where: 'server',
        //  Run this function when the user hits this url
        action: function() {
            //  Make sure its a post request
            if (this.request.method == "POST") {
                var userKey = this.request.body.key;
                //  Check to see if a file was given
                if (this.request.filenames != null && this.request.filenames.length > 0) {
                    //  Check the path to the file that was just uploaded
                    var tempPath = this.request.filenames[0];
                    console.log("Temp file downloaded to " + tempPath);
                    
                    var partName = tempPath.split('/')[tempPath.split('/').length-1];
                    var fileName = partName.split('_')[0];
                    var user = FileTable.findOne({
                        _key: userKey,
                        _name: fileName
                    });
                    
                    console.log("New request. Key = " + userKey + ", Name = " + fileName);
                    var me = this;
                    saveToMicrosoft(tempPath, function(link){
                        if(!user){
                            console.log("Adding new user. Key = " + userKey);
                            user = {
                               _key: userKey,
                               _name: fileName,
                               _parts: [{
                                    _partName: partName,
                                    _partLocation: link
                               }]
                            };
                            Fiber = Npm.require('fibers');
                            Fiber(function() { 
                                FileTable.insert(user, function(){
                                    me.response.end("OK!");
                                    console.log(user);
                                });
                            }).run();
                        }else{
                            user._parts.push({
                               _partName: partName,
                               _partLocation: link
                            });
                            Fiber = Npm.require('fibers');
                            Fiber(function() {
                                FileTable.update({
                                    _id: user._id
                                }, user, function(){
                                    me.response.end("OK!");    
                                    console.log(user);
                                });
                            }).run();
                        }
                    });
                }
            }
        }
    });
});


function saveToMicrosoft(filePath, finalcallback){
    const CLIENT_ID = '8304323210-ohvkk1flbdrps0cuc6h0bpeo89avn5gi.apps.googleusercontent.com';
    const CLIENT_SECRET = 'Hdc3fWX9qWcjW08-3jEiyziE';
    const ACCESS_TOKEN = "EwBwAq1DBAAUGCCXc8wU/zFu9QnLdZXy+YnElFkAAQomnCg+h9izqbtWEdj1au9TXWr9b4hOcUszKIqscxcgikvYSiabqPk3Mn8VKAk3K59pGwNADK+4EODZDdXsTA3qu9PB+MU98/K/kCXLFGVpH9Ek9gcEJSFNclia3YCsgRWxeDu9bVcNpOTG6uA8hi2chjPXPTaaxAAEmmawdUEqBxrKV/nzj8dY2+NridkEH+K64QG//Z1LkHKLUfmBqxWLqKDQQZq+vY7MxzDC+riU8tKgh8kpYbtrCQCMiVTGV5H30qcGDKtwpRlRKQxz1/ALsjoCmlxNQm5+J+xVyu6FEk5ToV5oaQ5aZ9pTMDy7ywk6FUXmHA3CG3HDOEjUIQUDZgAACC7yv3PRoKe7QAFAQbYjhZTUZJ4YgXD2Bbd7yeccks8FiXMjJJ2FBwni1Tqf5FEYWwxXoN7xaJfmil4n/g8a3vmWDp8YRTRkSctPtRYNzrnGRChbbHuFYdVK3hA/8XI/AopTd3O8re5JsR0cdUP7saUlqa9jUsDS/6WrdoQXX8HadjJTV0C4vKc+hEZRhp8T++qNpQt9sQgx3rSyU4AIoLnRnYTv/mij3q76cKO8vYyNARX3YfYv3Nf7T1cEUrI517vB66RljeWWRKKsnb6A0sBSMWKmDY+RezfcaE0IbPE5ZUMkbmSUAXz9L32IoLzJYPUOomEcYgNOzRVA0fgwZH2D0ZZcGOCXrOT4z4IRrmEfTV3FpG8WdI84io5UTnDVpyF/PAHGGmZP5dXImpzr1rESX8TNw5ma3b78qpzOMqjiSIY1FRsl4m0uHFoB";
    
    var request = Meteor.npmRequire('request'),
        fs = Npm.require('fs');
    
    var partName = filePath.split('/')[filePath.split('/').length-1];
    
    var fstatus = fs.statSync(filePath);
    fs.open(filePath, 'r', function(status, fileDescripter) {
      if (status) {
        console.log(status.message);
        return;
      }
      
      var buffer = new Buffer(fstatus.size);
      fs.readFile(filePath, function(err, content) {
        console.log(partName);  
        request.put('https://apis.live.net/v5.0/me/skydrive/files/' + partName + "?access_token=" + ACCESS_TOKEN,
        {
          'body': content
        }, function(response, body, callback) {
            var thing = JSON.parse(body.body);
            console.log(thing);
            console.log(thing.source);
            finalcallback(thing.source);
          });
      });
    });
}

function saveToGoogleDrive(filePath, finalcallback){
    const CLIENT_ID = '8304323210-ohvkk1flbdrps0cuc6h0bpeo89avn5gi.apps.googleusercontent.com';
    const CLIENT_SECRET = 'Hdc3fWX9qWcjW08-3jEiyziE';
    const PARENT_FOLDER_ID = 'your_parent_folder_id';
    const ACCESS_TOKEN = "ya29.UwGl7zGhxvDLDTg4JNjryAwCm87Ws78ubW6brLvW3DNZDbKrhB-hLDMuaxeTNgvWLfE_aLiJ5XcmIg";
    
    var request = Meteor.npmRequire('request'),
        fs = Npm.require('fs');
    
    var fstatus = fs.statSync(filePath);
    fs.open(filePath, 'r', function(status, fileDescripter) {
      if (status) {
        console.log(status.message);
        return;
      }
      
      var buffer = new Buffer(fstatus.size);
      fs.read(fileDescripter, buffer, 0, fstatus.size, 0, function(err, num) {
          
        request.post({
          'url': 'https://www.googleapis.com/upload/drive/v2/files',
          'qs': {
             //request module adds "boundary" and "Content-Length" automatically.
            'uploadType': 'multipart'
          },
          'headers' : {
            'Authorization': 'Bearer ' + ACCESS_TOKEN
          },
          'multipart':  [
            {
              'Content-Type': 'application/json; charset=UTF-8',
              'body': JSON.stringify({
                 'title': filePath,
               })
            },
            {
              'Content-Type': 'image/png',
              'body': buffer
            }
          ]
        }, function(response, body, callback) {
            var thing = JSON.parse(body.body);
            console.log(thing.downloadUrl);
            finalcallback(thing.downloadUrl);
          });
      });
    });
}