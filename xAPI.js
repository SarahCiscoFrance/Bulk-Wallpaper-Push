var request = require("request");
var fs = require("fs");

exports.updateEndpoint = function(
  ip,
  login,
  password,
  image,
  command,
  callback
) {
  var base64code = base64_encode(image);

  console.log(base64code);

  var xml =
    "<Command>" +
    "<UserInterface>" +
    "<Branding>" +
    "<Upload>" +
    "<Type>" +
    command +
    "</Type>" +
    "<body>" +
    base64code +
    "</body>" +
    "</Upload>" +
    "</Branding>" +
    "</UserInterface>" +
    "</Command>";

  var options = {
    method: "POST",
    url: "http://" + ip + "/putxml",
    headers: {
      Authorization:
        "Basic " + new Buffer(login + ":" + password).toString("base64"),
      "Content-Type": "text/xml"
    },
    body: xml
  };

  request(options, function(error, response, body) {
    if (error) {
      callback(error);
    }

    callback(body);
  });
};

exports.resetEndpoint = function(ip, login, password, callback) {
  var types = ["Branding", "HalfwakeBackground", "HalfwakeBranding"];

  var promises = [];

  types.forEach(function(type) {
    var promise = resetEndpointWithType(type, ip, login, password);
    promises.push(promise);
  });

  Promise.all(promises)
    .then(function(body) {
      callback(body);
    })
    .catch(function(err) {
      callback(err);
    });
};

function resetEndpointWithType(type, ip, login, password) {
  return new Promise(function(resolve, reject) {
    var xml =
      "<Command>" +
      "<UserInterface>" +
      "<Branding>" +
      "<Delete>" +
      "<Type>" +
      type +
      "</Type>" +
      "</Delete>" +
      "</Branding>" +
      "</UserInterface>" +
      "</Command>";

    var options = {
      method: "POST",
      url: "http://" + ip + "/putxml",
      headers: {
        Authorization:
          "Basic " + new Buffer(login + ":" + password).toString("base64"),
        "Content-Type": "text/xml"
      },
      body: xml
    };

    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      }

      resolve(body);
    });
  });
}

function base64_encode(image) {
  var bitmap = fs.readFileSync("./uploads/" + image);
  return new Buffer(bitmap).toString("base64");
}
