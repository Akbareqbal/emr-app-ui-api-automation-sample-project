function fn() {
  var env = karate.env || 'dev';
  var config = {};
  if (env == 'dev') {
    config.baseUrl = 'http://localhost:8080';
  } else {
    config.baseUrl = karate.properties['baseUrl'];
  }
  return config;
}
