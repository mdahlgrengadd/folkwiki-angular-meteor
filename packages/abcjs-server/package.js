/* Information about this package */
Package.describe({
  // Short two-sentence summary.
  summary: "ABC Notation",
  // Version number.
  version: "1.0.0",
  // Optional.  Default is package directory name.
  name: "mdahlgren:abc-js-server",
  // Optional github URL to your source repository.
  git: "https://github.com/something/something.git",
});

/* This defines your actual package */
Package.onUse(function (api) {
  // If no version is specified for an 'api.use' dependency, use the
  // one defined in Meteor 0.9.0.
  api.versionsFrom('0.9.0');
  // Use Underscore package, but only on the server.
  // Version not specified, so it will be as of Meteor 0.9.0.
  //api.use('underscore', 'server');
  // Use application-configuration package, version 1.0.0 or newer.
  //api.use('application-configuration@1.0.0');
  // Give users of this package access to the Templating package.
  //api.imply('templating')
  // Export the object 'Email' to packages or apps that use this package.
  
  // Specify the source code for the package.
  api.addFiles('api/abc_tunebook.js', 'server');
  api.addFiles('data/abc_tune.js', 'server');
  api.addFiles('parse/abc_common.js', 'server');
  api.addFiles('parse/abc_parse_directive.js', 'server');
  api.addFiles('parse/abc_parse_header.js', 'server');
  api.addFiles('parse/abc_parse_key_voice.js', 'server');
  api.addFiles('parse/abc_tokenizer.js', 'server');
  api.addFiles('parse/abc_parse.js', 'server');

  api.export('ABCJS', 'server');



});

/* This defines the tests for the package */
Package.onTest(function (api) {
  // Sets up a dependency on this package
  //api.use('username:package-name');
  // Allows you to use the 'tinytest' framework
  //api.use('tinytest@1.0.0');
  // Specify the source code for the package tests
  //api.addFiles('email_tests.js', 'server');
});

/* This lets you use npm packages in your package*/
//Npm.depends({
//  simplesmtp: "0.3.10",
//  "stream-buffers": "0.2.5"});