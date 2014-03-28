enyo.kind({
	name: 'Cumulus.Application',
	kind: 'enyo.Application',

	create: function() {
		enyo.store.addSources({localStorage: Cumulus.LocalStorageSource});
		this.inherited(arguments);
	},

	start: function() {
		this.inherited(arguments);

		var settings = new Cumulus.models.Settings();
		settings.fetch();
		this.set('settings', settings);
	},
});

enyo.ready(function() {
	new Cumulus.Application({name: 'app', view: 'Cumulus.Main'});
});
