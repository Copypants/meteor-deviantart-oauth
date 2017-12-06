Package.describe({
  name         : 'copypants:deviantart-oauth',
  version      : '0.1.0',
  summary      : 'Login service for deviantart accounts',
  git          : 'https://github.com/Copypants/meteor-deviantart-oauth',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1.1');

  // Third-party packages
  api.use('ecmascript');
  api.use('http', ['client', 'server']);
  api.use('templating', 'client');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('random', 'client');
  api.use('underscore', 'server');
  api.use('service-configuration', ['client', 'server']);

  // Package files
  api.addFiles('deviantart_client.js', 'client');
  api.addFiles('deviantart_server.js', 'server');

  // Exposed object
  api.export('Deviantart');
});
