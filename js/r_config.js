require.config({
  baseUrl: 'js',
  paths: {
    jquery: 'lib/jquery'
  },
  urlArgs: 'bust='+(new Date()).getTime()
});