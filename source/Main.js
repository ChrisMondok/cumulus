enyo.kind({
	name: "Cumulus.Main",
	classes: "onyx",

	published: {
		api: null,
		place: null,
		localForecast: null,
		store: null
	},

	bindings: [
		{from: '.localForecast', to: '.$.outlook.forecast'},
		{from: '.localForecast', to: '.$.detail.forecast'},
		{from: '.settings.useGPS', to:'.useGPS'},
		{from: '.settings.usePlace', to: '.usePlace'},
		{from: '.settings', to: '.$.preferences.settings'},
		{from: '.place', to: '.$.preferences.currentLocation'},
		{from: '.store', to: '.$.detail.store'},

		//TODO: delete these
		{from: '.api', to:'.$.outlook.$.minutelyForecast.api'},
		{from: '.place', to:'.$.outlook.$.minutelyForecast.place'}
	],

	observers:{
		relocate: ['useGPS', 'usePlace']
	},

	relocate: function() {
		if(this.get('useGPS')) {
			this.geolocate();
		}
		else {
			var place = this.settings.get('usePlace');
			if(typeof(place) == 'number')
				this.setPlace(this.settings.get('places').at(this.settings.get('usePlace')));
		}
	},

	components: [
		{kind: "Router", useHistory: true, triggerOnStart: false, routes:[
			{path: 'outlook', handler: 'showOutlook', context: 'owner', "default": true},
			{path: 'detail/:time', handler: 'showDetail', context: 'owner'},
			{path: 'preferences', handler: 'showPreferences', context: 'owner'}
		]},
		{content: "Beta", classes: "sash"},
		{name: "appmenu", kind: "Cumulus.Appmenu", components: [
			{content: "Preferences", ontap: 'routeToPreferences'},
			{content: "About", ontap: "showAbout"}
		]},
		{name: "panels", kind: "Panels", arrangerKind: "CardArranger", classes: "enyo-fit", draggable: false, onTransitionFinish: "panelIndexChanged", components: [
			{ name: "outlook", kind: "Cumulus.Outlook" },
			{ name: "detail", kind: "Cumulus.Detail" },
			{ name: "advisory", kind: "Cumulus.Advisory" },
			{ name: "preferences", kind: "Cumulus.Preferences" }
		]},
		{
			name: "locatingPopup",
			kind: "onyx.Popup",
			centered: true,
			modal: true,
			floating: true,
			scrim: true,
			autoDismiss: false,
			scrimWhenModal: true,
			components: [
				{kind: "Cumulus.Spinner", style: "display: inline-block; vertical-align: middle;"},
				{content: "Locating", fit: true, style: "display: inline-block; vertical-align: middle; padding-right: 8px;"}
			]
		},
		{
			name: "locationErrorPopup",
			kind: "onyx.Popup",
			centered: true,
			modal: true,
			floating: true,
			scrim: true,
			autoDismiss: false,
			scrimWhenModal: true,
			components: [
				{name:"locationErrorReason", content:"Geolocation Error"},
				{kind:"onyx.Button", content:"Retry", classes:"onyx-dark", ontap:"geolocate", style:"display:block; width: 100%; margin-top:1ex;"},
				{name:"useSavedLocationButton", kind:"onyx.Button", content:"Use a saved location", ontap:"useSavedLocation", classes:"onyx-dark", style:"display:block; width:100%; margin-top:1ex;" }
			]
		},
		{ kind: "Cumulus.AboutPopup" },
		{
			name: "errorPopup",
			kind: "onyx.Popup",
			centered: true, floating: true, modal: true, scrim: true, scrimWhenModal: true,
			components: [
				{tag: "h1", content: "Error"},
				{name: "errorDescription"}
			]
		},
		{kind: "Signals",
			onBackButton: "onBackButton",
			onAppMenu: "toggleAppMenu",
			onSettingsChanged: "settingsChanged",
			onTitleChanged:"titleChanged"
		}
	],

	statics: {
		formatTime: function(date) {
			if (typeof date == 'number')
				date = new Date(date);

			var hour = date.getHours() % 12;
			if(!hour)
				hour = 12;
			var minutes = date.getMinutes();
			if(minutes < 10)
				minutes = "0"+minutes;
			var ampm = ["AM","PM"][Math.floor(date.getHours()/12)];
			return hour+ ":" +minutes+" "+ampm;
		},
		formatDay: function(date) {
			if (typeof date == 'number')
				date = new Date(date);

			date.setHours(0,0,0,0);

			var today = new Date();
			today.setHours(0,0,0,0);

			if(today - date === 0)
				return $L("today");
			else
				return $L(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()]);
		}
	},

	create: function() {
		this.inherited(arguments);

		var settings = new Cumulus.models.Settings();
		enyo.store.addSources({localStorage: Cumulus.LocalStorageSource});
		settings.fetch();
		this.set('settings', settings);

		this.setApi(new Cumulus.API.ForecastIO);

		window.INSTANCE = this;

		this.$.router.trigger();
	},

	createStore: function() {
		var store = new enyo.Store();
		store.addSources({forecast: ForecastSource});
		this.set('store', store);

		return store;
	},

	getSetting: function(setting) {
		return this.$.preferences.settings.get(setting);
	},

	rendered: function() {
		this.inherited(arguments);

		onyx.scrim.make().addObserver("showing",this.obscuredChanged, this);
	},

	geolocate: function() {
		this.$.locationErrorPopup.hide();
		this.$.locatingPopup.show();
		Service.Geolocation.getLocation()
			.response(enyo.bind(this, function(sender,response) {
				this.$.locatingPopup.hide();
				this.setPlace(response);
			}))
			.error(enyo.bind(this, function(sender,error) {
				this.$.locatingPopup.hide();
				this.$.locationErrorReason.setContent(error.reason);
				this.$.locationErrorPopup.show();
			}));
	},

	showOutlook: function() {
		this.$.panels.selectPanelByName('outlook');
	},

	showDetail: function(time) {
		this.$.panels.selectPanelByName('detail');
	},

	showPreferences: function() {
		this.$.panels.selectPanelByName('preferences');
	},

	placeChanged: function(oldPlace, newPlace) {
		if(newPlace) {
			var store = this.createStore();
			var l = store.createRecord(Cumulus.models.LocalForecast,{location: newPlace, name: 'test'});
			this.set('localForecast', l);
			l.fetch({params:{extend:"hourly"}, success: function(){console.log("DONE");}});
		}
	},

	titleChanged: function(sender, event) {
		document.title = event.title;
	},

	onBackButton: function(sender,event) {
		if(this.$.panels.getIndex()) {
			this.back();
			event.stopPropagation();
			event.preventDefault();
		}
	},

	useSavedLocation: function() {
		this.$.locationErrorPopup.hide();
		this.routeToPreferences();

		setTimeout(this.settings.set.bind(this.settings, 'useGPS', false), 750);
	},

	routeToPreferences: function() {
		window.location.hash = 'preferences';
	},

	back: function(sender,event) {
		history.back();
	},

	obscuredChanged: function(oldValue, newValue, property) {
		if(property != "showing")
			alert("Property is "+property+", not showing!");
		else
			this.addRemoveClass("obscured",newValue);
	},

	receivedAPIError: function(sender, event) {
		this.$.errorDescription.setContent(event.error.description);
		alert("Got an error");
		alert(JSON.stringify(event.error));
		this.$.errorPopup.show();
	},

	showAbout: function() {
		this.$.aboutPopup.show();
	},

	toggleAppMenu: function() {
		if(this.$.appmenu.getShowing())
			this.$.appmenu.hide();
		else
			this.$.appmenu.showAtPosition({top: 0, left: 0});
	},

	settingsChanged: function(inSender, settings) {
		if(this._reloadInterval) {
			clearInterval(this._reloadInterval);
			this._reloadInterval = undefined;
		}

		if(settings.reloadInterval)
			this._reloadInterval = setInterval(enyo.bind(this,"onReloadInterval"), settings.reloadInterval * 1000 * 60);
	},

	onReloadInterval: function() {
		console.log("Reload now");
		webosCompatibility.showBanner("Reload now.");
	}
});
