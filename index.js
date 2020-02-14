var express = require("express");
var helmet = require("helmet");
var path = require("path");
var bodyParser = require("body-parser");
var logger = require("./setupLOG/log");
var formidable = require("formidable");
var fs = require("fs");
var xAPI = require("./xAPI");

require("dotenv").config();

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var oldpath = files.file.path;
    var newpath = "./uploads/" + files.file.name;
    fs.rename(oldpath, newpath, function(err) {
      if (err) throw err;
      res.write("File uploaded and moved!");
      res.end();
    });
  });
});

app.post("/update", function(req, res) {
  var ip = req.body.ip;
  var login = req.body.login;
  var password = req.body.password;
  var image = req.body.image;
  var command = req.body.command;

  xAPI.updateEndpoint(ip, login, password, image, command, function(data) {
    res.send(data);
  });
});

app.post("/reset", function(req, res) {
  var ip = req.body.ip;
  var login = req.body.login;
  var password = req.body.password;

  xAPI.resetEndpoint(ip, login, password, function(data) {
    res.send(data);
  });
});

app.listen(process.env.PORT, function() {
  logger.info("Bulk Wallpaper Push listening on port " + process.env.PORT);
});
