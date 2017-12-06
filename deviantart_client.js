Deviantart = {};       // jshint ignore:line

const NAME = 'deviantart';

// Request deviantart credentials for the user
// @param options {optional}
// @param callback {Function} Callback function to call on completion. Takes one argument, credentialToken on success, or Error on error.
Deviantart.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, credentialRequestCompleteCallback) and (credentialRequestCompleteCallback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({ service: NAME });
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError('Service not configured'));
    return;
  }
  var scope = options.scope || 'basic';

  var credentialToken = Random.secret();

  var loginStyle = OAuth._loginStyle(NAME, config, options);
  var loginUrl =
        'https://www.deviantart.com/oauth2/authorize' +
        '?response_type=code' +
        '&client_id=' + config.clientId +
        '&redirect_uri=' + OAuth._redirectUri(NAME, config, {}, { secure: true }) +
        '&scope=' + scope +
        '&state=' + OAuth._stateParam(loginStyle, credentialToken);
  loginUrl = loginUrl.replace('?close', '?close=true');

  OAuth.launchLogin({
    loginService: NAME,
    popupOptions: { height: 600 },
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken,
  });
};
