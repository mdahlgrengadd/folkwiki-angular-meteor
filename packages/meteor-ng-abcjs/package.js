Package.describe({
	summary: 'Lets you interface with abc.js',
	version: '0.0.1',
	name: 'mdahlgren:ng-abc.js',
	git: 'https://github.com/'
});

Package.onUse(function(api) {
	api.addFiles(['lib/ng-abcjs.js'], 'client');
	api.addFiles(['lib/abc2.2.js'], 'client');
	api.addFiles(['lib/abc_plugin.js'], 'client');
});


