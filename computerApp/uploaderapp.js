var watch = require('watch');

var completedFiles = [];

watch.watchTree('.', function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null) {
      // Finished walking the tree
    } else if (prev === null) {
        for(var i = 0; i < completedFiles.length; i++){
            if(completedFiles[i] == f){
                return;
            }
        }
        
        watch.unwatchTree('.');
        
        console.log(f);
        
        completedFiles.push(f);
        var spawn = require('child_process').spawn;
        var prc = spawn('./main',  ['-key', 'Client.key', f]);
        
        //noinspection JSUnresolvedFunction
        prc.stdout.setEncoding('utf8');

        prc.on('close', function (code) {
            console.log('process exit code ' + code);
            uploadCompressedFile("parts/" + f + "_" + 0 + ".encrypted", function(){
                uploadCompressedFile("parts/" + f + "_" + 1 + ".encrypted", function(){
                    uploadCompressedFile("parts/" + f + "_" + 2 + ".encrypted", function(){
                    
                    });    
                });        
            });    
        });
    }
});

function uploadCompressedFile(fileName, callback){
    var request = require('request');
    var fs = require('fs');
    var req = request.post("http://projectrhino.cloudapp.net/upload/file", function (err, resp, body) {
      if (err) {
        console.log('Error!');
        console.log(err);
      } else {
        console.log('URL: ' + body);
      }
      callback();
    });
    
    
    var form = req.form();
    
    form.append('key', "somerandompass");
    
     var partName =  fileName.split('/')[fileName.split('/').length-1];
     console.log(partName);
     console.log(fileName);
    form.append('file', fs.createReadStream(fileName.replace(".txt", "")), {
      filename: partName,
      contentType: 'text/plain'
    });
}