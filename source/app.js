enyo.kind({
	name: 'cumulus.Application',
	kind: 'enyo.Application',

	create: function() {
		enyo.store.addSources({localStorage: cumulus.LocalStorageSource});
		this.inherited(arguments);
	},

	start: function() {
		this.inherited(arguments);

		var settings = new cumulus.models.Settings();
		settings.fetch();
		this.set('settings', settings);
	}
});

enyo.ready(function() {
	var view = 'cumulus.Main';

	if (['androidChrome', 'androidFirefox', 'android'].indexOf(enyo.platform.platformName) != -1) {
		enyo.Scroller.prototype.strategyKind = 'ScrollStrategy';
		view = 'cumulus.os.AndroidMain';
	}

	if (enyo.platform.webos) {
		view = 'cumulus.os.WebOSMain';
	}

	new cumulus.Application({name: 'app', view: view});
});

