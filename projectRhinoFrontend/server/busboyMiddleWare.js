/*
  Since meteor 1.0 we need to do this to get files to upload.
  https://github.com/EventedMind/iron-router/issues/909
*/
if (Meteor.isServer) {
  var Busboy = Meteor.npmRequire("busboy"),
      fs = Npm.require("fs"),
      os = Npm.require("os"),
      path = Npm.require("path");

  Router.onBeforeAction(function (req, res, next) {
    var filenames = []; // Store filenames and then pass them to request.
    if (req.method === "POST" && req.originalUrl.indexOf("upload/file") >= 0) {
      var busboy = new Busboy({ headers: req.headers });
      busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
        var saveTo = path.join(os.tmpDir(), filename);
        file.pipe(fs.createWriteStream(saveTo));
        filenames.push(saveTo);
      });
      busboy.on("field", function(fieldname, value) {
        req.body = req.body || {};
        req.body[fieldname] = value;
      });
      busboy.on("finish", function () {
        // Pass filenames to request
        req.filenames = filenames;
        next();
      });
      // Pass request to busboy
      req.pipe(busboy);
    } else {
      next();
    }
 });
}
