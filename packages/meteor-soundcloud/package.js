Package.describe({
	summary: 'Lets you interface with soundcloud.js',
	version: '0.0.1',
	name: 'mdahlgren:soundcloud.js',
	git: ''
});

Package.onUse(function(api) {
	//api.export('SC', 'server');
	//api.addFiles(['lib/soundcloud.js'], 'server');
	api.addFiles(['lib/soundcloud-sdk-3.0.0.js'], 'client');
	api.addFiles(['lib/soundcloud-widget.js'], 'client');
});

Npm.depends({
	'soundcloud': '3.0.0',
});
