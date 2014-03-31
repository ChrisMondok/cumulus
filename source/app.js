enyo.kind({
	name: 'cumulus.Application',
	kind: 'enyo.Application',

	create: function() {
		enyo.store.addSources({localStorage: cumulus.LocalStorageSource});
		this.inherited(arguments);
	},

	bindings:[
		{from: '.settings.usePlace', to: '.usePlace'}
	],

	computed:{
		preferredLocation: ['usePlace', 'geolocation', {cached: true}]
	},

	preferredLocation: function(old, n, prop) {
		if(this.get('usePlace') == -1)
			return this.get('geolocation');
		else {
			var settings = this.get('settings');
			if(settings)
				return this.get('settings').get('places').at(this.get('usePlace'));
		}
		return undefined;
	},

	start: function() {
		this.inherited(arguments);

		this.loadSettings();

		this.geolocate();
	},

	loadSettings: function() {
		var settings = new cumulus.models.Settings();
		settings.fetch();
		this.set('settings', settings);
	},

	geolocate: function() {
		this.set('geolocation', undefined);
		this.set('geolocationError', null);
		Service.Geolocation.getLocation().response(this, function(service, response) {
			this.set('geolocation', response);
			this.set('geolocationError', null);
		}).error(this, function(service, response) {
			this.set('geolocationError', response);
			this.set('geolocation', null);
		});
	}
});

enyo.ready(function() {
	var view = 'cumulus.Main';

	if (['androidChrome', 'androidFirefox', 'android'].some(function(p) { return p in enyo.platform; })) {
		enyo.Scroller.prototype.strategyKind = 'ScrollStrategy';
		enyo.dom.addBodyClass('android');
		view = 'cumulus.os.AndroidMain';
	}

	if (enyo.platform.webos) {
		enyo.dom.addBodyClass('webOS');
		view = 'cumulus.os.WebOSMain';
	}

	if (enyo.platform.ios) {
		enyo.dom.addBodyClass('ios');
	}

	new cumulus.Application({name: 'app', view: view});
});
