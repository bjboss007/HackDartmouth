CLIENT_ID = '8304323210-ohvkk1flbdrps0cuc6h0bpeo89avn5gi.apps.googleusercontent.com';
SCOPES = 'https://www.googleapis.com/auth/drive';

Template.frontpage.rendered = function() {
    $("#OneDriveSignInBtn i").addClass('class glyphicon glyphicon-ok-sign');
    client = new Dropbox.Client({ key: "gop4eyyqv97z8cp" });
     // Try to use cached credentials.
    client.authenticate({interactive: false}, function(error, client) {
      if (error) {
          console.log(error);
        //return handleError(error);
      }
      if (client.isAuthenticated()) {
        // Cached credentials are available, make Dropbox API calls.
            $("#DropBoxSignInBtn i").addClass('class glyphicon glyphicon-ok-sign');
            
      } 
    });
};

Template.frontpage.events({
    "click #DropBoxSignInBtn": function(event, template) {
      //  signIntoDropbox();
      $("#DropBoxSignInBtn i").addClass('class glyphicon glyphicon-ok-sign');
    },
    "click #GoogleDriveSignInBtn": function(event, template) {
        signInGoogleDrive();
    },
    "click #OneDriveSignInBtn": function(event, template) {
        signInOneDrive();
    },
    "click #ReadyBtn": function(event, template) {
        ReadyBtnPressed();
    }
});

function onAuthenticated(token, authWindow) {
      if (token) {
        if (authWindow) {
          removeLoginButton();
          authWindow.close();
        }
        console.log("OneDrive Token = " + token);
        $("#OneDriveSignInBtn i").addClass('class glyphicon glyphicon-ok-sign');
        
      }
      else {
        alert("Error signing in");
      }
    }

      
      
function signIntoDropbox(){
   /* client.authenticate(function (error, client) {
                if (error) {
                    alert('Error: ' + error);
                }
            });*/
            $("#DropBoxSignInBtn i").addClass('class glyphicon glyphicon-ok-sign');
}

function checkAuth() {
        gapi.auth.authorize(
            {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
            handleAuthResult);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//OneDrive API
function odauth(wasClicked) {
  ensureHttps();
  var token = getTokenFromCookie();
  if (token) {
    onAuthenticated(token);
  }
  else if (wasClicked) {
    challengeForAuth();
  }
  else {
    showLoginButton();
  }
}

// for added security we require https
function ensureHttps() {
  if (window.location.protocol != "https:") {
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
  }
}


function getAuthInfoFromUrl() {
  if (window.location.hash) {
    var authResponse = window.location.hash.substring(1);
    var authInfo = JSON.parse(
      '{"' + authResponse.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
      function(key, value) { return key === "" ? value : decodeURIComponent(value); });
    return authInfo;
  }
  else {
    alert("failed to receive auth token");
  }
}

function getTokenFromCookie() {
  var cookies = document.cookie;
  var name = "odauth=";
  var start = cookies.indexOf(name);
  if (start >= 0) {
    start += name.length;
    var end = cookies.indexOf(';', start);
    if (end < 0) {
      end = cookies.length;
    }
    else {
      postCookie = cookies.substring(end);
    }

    var value = cookies.substring(start, end);
    return value;
  }

  return "";
}

function setCookie(token, expiresInSeconds) {
  var expiration = new Date();
  expiration.setTime(expiration.getTime() + expiresInSeconds * 1000);
  var cookie = "odauth=" + token +"; path=/; expires=" + expiration.toUTCString();

  if (document.location.protocol.toLowerCase() == "https") {
    cookie = cookie + ";secure";
  }

  document.cookie = cookie;
}

function getAppInfo() {
  var scriptTag = document.getElementById("odauth");
  if (!scriptTag) {
    alert("the script tag for odauth.js should have its id set to 'odauth'");
  }

  var clientId = scriptTag.getAttribute("clientid");
  if (!clientId) {
    alert("the odauth script tag needs a clientId attribute set to your application id");
  }

  var scopes = scriptTag.getAttribute("scopes");
  if (!scopes) {
    alert("the odauth script tag needs a scopes attribute set to the scopes your app needs");
  }

  var redirectUri = scriptTag.getAttribute("redirecturi");
  if (!redirectUri) {
    alert("the odauth script tag needs a redirectUri attribute set to your redirect landing url");
  }

  var appInfo = {
    "clientId": clientId,
    "scopes": scopes,
    "redirectUri": redirectUri
  };

  return appInfo;
}

// called when a login button needs to be displayed for the user to click on.
// if a customLoginButton() function is defined by your app, it will be called
// with 'true' passed in to indicate the button should be added. otherwise, it
// will insert a textual login link at the top of the page. if defined, your
// showCustomLoginButton should call challengeForAuth() when clicked.
function showLoginButton() {
  if (typeof showCustomLoginButton === "function") {
    showCustomLoginButton(true);
    return;
  }

  var loginText = document.createElement('a');
  loginText.href = "#";
  loginText.id = "loginText";
  loginText.onclick = challengeForAuth;
  loginText.innerText = "[sign in]";
  document.body.insertBefore(loginText, document.body.children[0]);
}

// called with the login button created by showLoginButton() needs to be
// removed. if a customLoginButton() function is defined by your app, it will
// be called with 'false' passed in to indicate the button should be removed.
// otherwise it will remove the textual link that showLoginButton() created.
function removeLoginButton() {
  if (typeof showCustomLoginButton === "function") {
    showCustomLoginButton(false);
    return;
  }

  var loginText = document.getElementById("loginText");
  if (loginText) {
    document.body.removeChild(loginText);
  }
}

function challengeForAuth() {
  var appInfo = getAppInfo();
  var url =
    "https://login.live.com/oauth20_authorize.srf" +
    "?client_id=" + appInfo.clientId +
    "&scope=" + encodeURIComponent(appInfo.scopes) +
    "&response_type=token" +
    "&redirect_uri=" + encodeURIComponent(appInfo.redirectUri);
  popup(url);
}

function popup(url) {
  var width = 525,
      height = 525,
      screenX = window.screenX,
      screenY = window.screenY,
      outerWidth = window.outerWidth,
      outerHeight = window.outerHeight;

  var left = screenX + Math.max(outerWidth - width, 0) / 2;
  var top = screenY + Math.max(outerHeight - height, 0) / 2;

  var features = [
              "width=" + width,
              "height=" + height,
              "top=" + top,
              "left=" + left,
              "status=no",
              "resizable=yes",
              "toolbar=no",
              "menubar=no",
              "scrollbars=yes"];
  var popup = window.open(url, "oauth", features.join(","));
  if (!popup) {
    alert("failed to pop up auth window");
  }

  popup.focus();
}

//Google Drive API
function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
             $("#GoogleDriveSignInBtn i").addClass('class glyphicon glyphicon-ok-sign');
             console.log(authResult);
        } else {
            console.log(authResult);
        }
}

function signInOneDrive(){
    odauth(true);
}

function signInGoogleDrive(){
    checkAuth();    
}

function ReadyBtnPressed(){
    if ( $("#GoogleDriveSignInBtn i").hasClass('class glyphicon glyphicon-ok-sign') 
    && $("#OneDriveSignInBtn i").hasClass('class glyphicon glyphicon-ok-sign')
    && $("#DropBoxSignInBtn i").hasClass('class glyphicon glyphicon-ok-sign')) {
        window.location = "/UI";
    } else {
        alert("Error signing in");
    }
}
