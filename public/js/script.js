Dropzone.autoDiscover = false;

$(function() {
  var alertUpdate = $("#alertFormUpdate");
  var alertReset = $("#alertFormReset");
  var endpointSelectedUpdate = [];
  var endpointSelectedReset = [];
  alertUpdate.hide();
  alertReset.hide();

  var imagesArray = {
    branding: null,
    halfwakeBackground: null,
    halfwakeBranding: null
  };

  var dropzoneBranding = new Dropzone("#dropzoneBranding", {
    url: "/upload",
    autoProcessQueue: false,
    maxFiles: 1,
    maxFilesize: 4,
    acceptedFiles: "image/*",
    addRemoveLinks: true,
    init: function() {
      this.on("success", function() {
        updateEndpoints("Branding");
      });
    }
  });

  var dropzoneHBackground = new Dropzone("#dropzoneHBackground", {
    url: "/upload",
    autoProcessQueue: false,
    maxFiles: 1,
    maxFilesize: 4,
    acceptedFiles: "image/*",
    addRemoveLinks: true,
    init: function() {
      this.on("success", function() {
        updateEndpoints("HalfwakeBackground");
      });
    }
  });

  var dropzoneHBranding = new Dropzone("#dropzoneHBranding", {
    url: "/upload",
    autoProcessQueue: false,
    maxFiles: 1,
    maxFilesize: 4,
    acceptedFiles: "image/*",
    addRemoveLinks: true,
    init: function() {
      this.on("success", function() {
        updateEndpoints("HalfwakeBranding");
      });
    }
  });

  dropzoneBranding.on("addedfile", function(file) {
    alertUpdate.hide();
    if (!imagesArray.branding) {
      imagesArray.branding = file.name;
    }
  });

  dropzoneHBackground.on("addedfile", function(file) {
    alertUpdate.hide();
    if (!imagesArray.halfwakeBackground) {
      imagesArray.halfwakeBackground = file.name;
    }
  });

  dropzoneHBranding.on("addedfile", function(file) {
    alertUpdate.hide();
    if (!imagesArray.halfwakeBranding) {
      imagesArray.halfwakeBranding = file.name;
    }
  });

  dropzoneBranding.on("reset", function() {
    imagesArray.branding = null;
  });

  dropzoneHBackground.on("reset", function() {
    imagesArray.halfwakeBackground = null;
  });

  dropzoneHBranding.on("reset", function() {
    imagesArray.halfwakeBranding = null;
  });

  $.getJSON(
    "http://websrv2.ciscofrance.com:15161/codecs/app/wallpaper",
    function(data) {
      var codecs = data.codecs;

      for (var codec in codecs) {
        $("#endpoints").append(
          "" +
            '<div class="btn-group btn-group-toggle mt-2 ml-2 mr-2" data-toggle="buttons">' +
            '<label class="btn btn-secondary">' +
            '<input class="checkboxUpdate" type="checkbox" value="' +
            codecs[codec].name.capitalize() +
            "-" +
            codecs[codec].ip +
            "-" +
            codecs[codec].login +
            "-" +
            codecs[codec].password +
            '"> ' +
            codecs[codec].name.capitalize() +
            "</label>" +
            "</div>"
        );

        $("#endpointsReset").append(
          "" +
            '<div class="btn-group btn-group-toggle mt-2 ml-2 mr-2" data-toggle="buttons">' +
            '<label class="btn btn-secondary">' +
            '<input class="checkboxReset" type="checkbox" value="' +
            codecs[codec].name.capitalize() +
            "-" +
            codecs[codec].ip +
            "-" +
            codecs[codec].login +
            "-" +
            codecs[codec].password +
            '"> ' +
            codecs[codec].name.capitalize() +
            "</label>" +
            "</div>"
        );
      }
    }
  );

  $(document).on("change", ".checkboxUpdate", function() {
    alertUpdate.hide();

    if (this.checked) {
      endpointSelectedUpdate.push(this.defaultValue);
    } else {
      var i = endpointSelectedUpdate.indexOf(this.defaultValue);
      if (i !== -1) {
        endpointSelectedUpdate.splice(i, 1);
      }
    }
  });

  $(document).on("change", ".checkboxReset", function() {
    alertReset.hide();

    if (this.checked) {
      endpointSelectedReset.push(this.defaultValue);
    } else {
      var i = endpointSelectedReset.indexOf(this.defaultValue);
      if (i !== -1) {
        endpointSelectedReset.splice(i, 1);
      }
    }
  });

  $("#submitFormUpdate").click(function() {
    if (
      !imagesArray.branding &&
      !imagesArray.halfwakeBranding &&
      !imagesArray.halfwakeBackground
    ) {
      alertUpdate.html("Please add at least one picture");
      alertUpdate.show();
      return;
    }

    if (endpointSelectedUpdate.length === 0) {
      alertUpdate.html("Please choose at least one endpoint");
      alertUpdate.show();
      return;
    }

    dropzoneBranding.processQueue();
    dropzoneHBackground.processQueue();
    dropzoneHBranding.processQueue();
  });

  $("#submitFormReset").click(function() {
    if (endpointSelectedReset.length === 0) {
      alertReset.html("Please choose at least one endpoint");
      alertReset.show();
      return;
    }

    updateEndpointsReset();
  });

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  function updateEndpoints(command) {
    var promises = [];

    var submit = $("#submitFormUpdate");
    submit.html('Loading <i class="fas fa-sync fa-spin"></i>');
    submit.prop("disabled", true);

    endpointSelectedUpdate.forEach(function(endpoint) {
      var promise = updateImages(endpoint, command);
      promises.push(promise);
    });

    Promise.all(promises)
      .then(function(data) {
        submit.prop("disabled", false);
        submit.html('Uploaded <i class="fas fa-check"></i>');

        setTimeout(function() {
          resetForm();
        }, 3000);
      })
      .catch(function(err) {
        alert(err);
      });
  }

  function updateEndpointsReset() {
    var promises = [];

    var submit = $("#submitFormReset");
    submit.html('Loading <i class="fas fa-sync fa-spin"></i>');
    submit.prop("disabled", true);

    endpointSelectedReset.forEach(function(endpoint) {
      var promise = updateImageReset(endpoint);
      promises.push(promise);
    });

    Promise.all(promises)
      .then(function(data) {
        submit.prop("disabled", false);
        submit.html('Resetted <i class="fas fa-check"></i>');

        setTimeout(function() {
          resetFormReset();
        }, 3000);
      })
      .catch(function(err) {
        alert(err);
      });
  }

  function updateImages(endpoint, command) {
    return new Promise(function(resolve, reject) {
      var endpointArray = endpoint.split("-");
      var name = endpointArray[0];
      var ip = endpointArray[1];
      var login = endpointArray[2];
      var password = endpointArray[3];

      var promises = [];

      if (command == "Branding") {
        var promise1 = updateImage(
          name,
          ip,
          login,
          password,
          imagesArray.branding,
          "Branding"
        );
        promises.push(promise1);
      } else if (command == "HalfwakeBackground") {
        var promise2 = updateImage(
          name,
          ip,
          login,
          password,
          imagesArray.halfwakeBackground,
          "HalfwakeBackground"
        );
        promises.push(promise2);
      } else if (command == "HalfwakeBranding") {
        var promise3 = updateImage(
          name,
          ip,
          login,
          password,
          imagesArray.halfwakeBranding,
          "HalfwakeBranding"
        );
        promises.push(promise3);
      }

      Promise.all(promises)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  function updateImageReset(endpoint) {
    return new Promise(function(resolve, reject) {
      var endpointArray = endpoint.split("-");
      var name = endpointArray[0];
      var ip = endpointArray[1];
      var login = endpointArray[2];
      var password = endpointArray[3];

      $.post(
        "/reset",
        {
          ip: ip,
          login: login,
          password: password
        },
        function(data) {
          if (data[0].includes("OK")) {
            new Noty({
              type: "success",
              text: name + " réinitialisé !"
            }).show();
          } else {
            new Noty({
              type: "error",
              text: "Erreur : " + data
            }).show();
          }

          resolve(data);
        }
      );
    });
  }

  function updateImage(name, ip, login, password, image, command) {
    return new Promise(function(resolve, reject) {
      $.post(
        "/update",
        {
          ip: ip,
          login: login,
          password: password,
          image: image,
          command: command
        },
        function(data) {
          if (data.includes("OK")) {
            new Noty({
              type: "success",
              text: name + " - " + command + " - mis à jour !"
            }).show();
          } else {
            new Noty({
              type: "error",
              text: "Erreur : " + data
            }).show();
          }
          resolve(data);
        }
      );
    });
  }

  function resetForm() {
    $("#submitFormUpdate").html("Submit");
    dropzoneHBranding.removeAllFiles(true);
    dropzoneHBackground.removeAllFiles(true);
    dropzoneBranding.removeAllFiles(true);

    for (var input in $(".checkboxUpdate")) {
      $(".checkboxUpdate")[input].checked = false;
      $(".checkboxUpdate")
        .parent()
        .removeClass("active");
    }

    endpointSelectedUpdate = [];
  }

  function resetFormReset() {
    $("#submitFormReset").html("Submit");

    for (var input in $(".checkboxReset")) {
      $(".checkboxReset")[input].checked = false;
      $(".checkboxReset")
        .parent()
        .removeClass("active");
    }

    endpointSelectedReset = [];
  }
});
