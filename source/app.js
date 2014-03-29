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
	if (['androidChrome', 'androidFirefox'].indexOf(enyo.platform.platformName) != -1) {
		enyo.Scroller.prototype.strategyKind = 'ScrollStrategy';
	}
	new cumulus.Application({name: 'app', view: 'cumulus.Main'});
});

