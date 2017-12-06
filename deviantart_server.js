Deviantart = {};       // jshint ignore:line

const request = require('request');

const NAME = 'deviantart';

const TOKEN_URI = 'https://www.deviantart.com/oauth2/token',
      API_URL   = 'https://www.deviantart.com/api/v1/oauth2';

Deviantart.whitelistedFields = ['userid', 'username', 'usericon', 'type'];

OAuth.registerService(NAME, 2, null, function (query) {

  let { accessToken, refreshToken, expiresIn } = exchangeCodeForTokens(query.code);

  let userInfo = getUserInfo(accessToken) || {};

  let serviceData = {
    accessToken,
    refreshToken,
    id       : userInfo && userInfo.userid,
    expiresAt: (+new Date()) + (1000 * expiresIn || 0)
  };

  return {
    serviceData,
    options: {
      profile: _.pick(userInfo, Deviantart.whitelistedFields),
    }
  };
});

/**
 * Exchange OAuth code to access tokens
 * @param {String} code OAuth grant code
 * @returns {{accessToken: {String}, expiresIn: *}}
 */
var exchangeCodeForTokens = function(code) {
  let config = ServiceConfiguration.configurations.findOne({ service: NAME });
  if (!config) {
    throw new ServiceConfiguration.ConfigError('Service not configured');
  }

  try {
    let redirectUri = OAuth._redirectUri(NAME, config, {}, { secure: true }).replace('?close', '?close=true');

    let qs = {
      code         : code,
      client_id    : config.clientId,
      client_secret: OAuth.openSecret(config.secret),
      redirect_uri : redirectUri,
      grant_type   : 'authorization_code'
    };

    let data = requestSync({ url: TOKEN_URI, qs });
    if (data.error) {
      throw new Error(data.error);
    }
    if (data.status !== 'success') {
      throw new Error(`Error obtaining token: ${JSON.stringify(data)}`);
    }

    return {
      accessToken : data.access_token,
      refreshToken: data.refresh_token,
      expiresIn   : data.expires_in,
    };

  } catch (e) {
    throw new Error(`Failed to complete OAuth handshake with Deviantart: ` + e.message);
  }
};

/**
 * Fetch the Deviantart account info
 * @param {String} accessToken Deviantart valid access token
 * @returns {Object} https://www.deviantart.com/developers/http/v1/20160316/user_profile/0b06f6d6c8aa25b33b52f836e53f4f65
 */
var getUserInfo = function(accessToken) {
  let url = `${API_URL}/user/whoami`;
  var headers = {
    'Authorization': 'Bearer ' + accessToken
  };
  return requestSync({ url, headers });
};

var requestSync = function(options={}) {
  options.headers = _.defaults(options.headers || {}, {
    'User-Agent': 'curl/7.43.0',
    'Accept'    : '*/*'
  });

  Log.debug(`[Deviantart:requestSync] options: ${JSON.stringify(options)}`);

  let runSyncResult = Async.runSync((done) => {
    request(options, (err, response, body) => done(err, body));
  });

  Log.debug(`[Deviantart:requestSync] runSyncResult: ${JSON.stringify(runSyncResult)}`);

  if (runSyncResult.error) {
    throw new Error(runSyncResult.error);
  }
  try {
    return JSON.parse(runSyncResult.result);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${runSyncResult.result}`);
  }
};

Deviantart.retrieveCredential = function (credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
