Package.describe({
	summary: 'Lets you interface with ng-polymer-elements.js',
	version: '0.0.1',
	name: 'mdahlgren:ng-polymer-elements.js',
	git: 'https://github.com/GabiAxel/ng-polymer-elements.git'
});

Package.onUse(function(api) {
	api.addFiles(['lib/ng-polymer-elements.js'], 'client');
});