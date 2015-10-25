Package.describe({
	summary: 'Lets you interface with string.js',
	version: '0.0.1',
	name: 'mdahlgren:string.js',
	git: 'https://github.com/jprichardson/string.js.git'
});

Package.onUse(function(api) {
	api.export('S', 'server');
	api.addFiles(['lib/string.js'], 'server');
});

Npm.depends({
	'string': '3.3.1',
});
