Template.onedrive.rendered = function() {
    onAuthCallback();
    //window.close();
};


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

function setCookie(token, expiresInSeconds) {
  var expiration = new Date();
  expiration.setTime(expiration.getTime() + expiresInSeconds * 1000);
  var cookie = "odauth=" + token +"; path=/; expires=" + expiration.toUTCString();

  if (document.location.protocol.toLowerCase() == "https") {
    cookie = cookie + ";secure";
  }

  document.cookie = cookie;
}

function onAuthCallback() {
  var authInfo = getAuthInfoFromUrl();
  var token = authInfo["access_token"];
  console.log(token);
  var expiry = parseInt(authInfo["expires_in"]);
  setCookie(token, expiry);
  window.opener.onAuthenticated(token, window);
}