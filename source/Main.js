enyo.kind({
	name: "cumulus.Main",
	classes: "onyx main",

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
		{from: '.app.settings', to: '.settings'},
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
		{name: "appmenu", kind: "cumulus.Appmenu", components: [
			{content: "Preferences", ontap: 'routeToPreferences'},
			{content: "About", ontap: "showAbout"}
		]},
		{name: "panels", kind: "Panels", arrangerKind: "CardArranger", classes: "enyo-fit", draggable: false, onTransitionFinish: "panelIndexChanged", components: [
			{ name: "outlook", kind: "cumulus.Outlook" },
			{ name: "detail", kind: "cumulus.Detail" },
			{ name: "advisory", kind: "cumulus.Advisory" },
			{ name: "preferences", kind: "cumulus.Preferences" }
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
				{kind: "cumulus.Spinner", style: "display: inline-block; vertical-align: middle;"},
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
		{ kind: "cumulus.AboutPopup" },
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

	create: function() {
		this.inherited(arguments);

		this.setApi(new cumulus.api.ForecastIO);

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
			var l = store.createRecord(cumulus.models.LocalForecast,{location: newPlace, name: 'test'});
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

	obscuredChanged: function(oldValue, newValue) {
		this.addRemoveClass("obscured",newValue);
	},

	receivedAPIError: function(sender, event) {
		this.$.errorDescription.setContent(event.error.description);
		this.$.errorPopup.show();
	},

	showAbout: function() {
		this.$.aboutPopup.show();
	},

	toggleAppMenu: function() {
		if(this.$.appmenu.getShowing())
			this.$.appmenu.hide();
		else
			this.$.appmenu.show();
	}
});
