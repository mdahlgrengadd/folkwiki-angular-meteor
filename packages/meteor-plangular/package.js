Package.describe({
	summary: 'Lets you interface with plangular.js',
	version: '0.0.1',
	name: 'mdahlgren:plangular.js',
	git: 'https://github.com/jxnblk/plangular.git'
});

Package.onUse(function(api) {
	//api.export('plangular', 'client');
	api.addFiles(['lib/audio.js'], 'client');
	api.addFiles(['lib/audio-player.js'], 'client');
	api.addFiles(['lib/browser-jsonp.js'], 'client');
	api.addFiles(['lib/corslite.js'], 'client');
	api.addFiles(['lib/query-string.js'], 'client');
	api.addFiles(['lib/strict-uri-encode.js'], 'client');
	api.addFiles(['lib/soundcloud-resolve-jsonp.js'], 'client');
	api.addFiles(['lib/hhmmss.js'], 'client');




	api.addFiles(['lib/plangular.js'], 'client');
});


Npm.depends({
	'soundcloud-resolve-jsonp': '1.3.0',
	'audio-player': '1.1.0',
	'hhmmss': '1.0.0'
});
