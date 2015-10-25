Package.describe({
	summary: 'Lets you interface with Sql.js',
	version: '0.0.1',
	name: 'kripken:sql.js',
	git: 'https://github.com/kripken/sql.js.git'
});

Package.onUse(function(api) {
	api.export('SQL', 'server');
	api.addFiles(['lib/sql.js'], 'server');
});

Npm.depends({
	'sql.js': '0.2.21',
});
