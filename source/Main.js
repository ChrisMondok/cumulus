enyo.kind({
	name: "cumulus.Main",
	classes: "onyx obscurable",

	published: {
		api: null,
		place: null,
		localForecast: null,
		store: null
	},

	bindings: [
		{from: '.localForecast', to: '.$.outlook.forecast'},
		{from: '.localForecast', to: '.$.detail.forecast'},
		{from: '.app.settings', to: '.settings'},
		{from: '.store', to: '.$.detail.store'},
		{from: '.app.preferredLocation', to: '.place'},
		{from: '.app.preferredLocation', to: '.$.locationErrorPopup.showing', transform: function(g) {return g === null;}},
		{from: '.app.geolocationError', to: '.$.locationErrorReason.content', transform: function(e) {return e ? e.reason : '';}}
	],


	initComponents: function() {
		this.createChrome([
			{name: "appmenu", kind: "cumulus.Appmenu", components: [
				{content: "Preferences", ontap: 'routeToPreferences'},
				{content: "About", ontap: "routeToAbout"}
			]}
		]);
		this.inherited(arguments);
	},

	components: [
		{kind: "Router", useHistory: true, triggerOnStart: false, routes:[
			{path: 'outlook', handler: 'routeHandler', context: 'owner', "default": true},
			{path: 'detail/:time', handler: 'routeHandler', context: 'owner'},
			{path: 'preferences', handler: 'routeHandler', context: 'owner'}
		]},
		{name: "panels", kind: "Panels", tag:'main', arrangerKind: "CardArranger",  draggable: false, onTransitionFinish: "panelIndexChanged", components: [
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
				{content: "Locating", style: "display: inline-block; vertical-align: middle; padding-right: 8px;"}
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
				{tag: 'header', name: 'locationErrorReason', content:"Geolocation Error"},
				{tag: 'footer', defaultKind: 'onyx.Button', controlClasses: 'onyx-dark', components:[
					{content: "Retry", ontap:'retryGeolocation'},
					{content:"Use a saved location", ontap:'useSavedLocation'}
				]}
			]
		},
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

		window.INSTANCE = this;

		this.$.router.trigger();
	},

	createStore: function() {
		var store = new enyo.Store();
		store.addSources({forecast: ForecastSource});
		this.set('store', store);

		return store;
	},

	getPopups: function() {
		return this.getComponents().filter(function(cmp) {
			return cmp instanceof enyo.Popup;
		});
	},

	getSetting: function(setting) {
		return this.$.preferences.settings.get(setting);
	},

	rendered: function() {
		this.inherited(arguments);

		onyx.scrim.make().addObserver("showing",this.obscuredChanged, this);
	},

	showGeolocationError: function() {
		this.$.locatingPopup.hide();
		this.$.locationErrorPopup.show();
	},

	routeHandler: function(a, b, c) {
		var panels = this.$.panels.getPanels().map(function(p){return p.get('name');});
		var path = this.$.router.get('location').split('/')[0] || 'outlook';

		if(panels.indexOf(path) != -1)
			this.$.panels.selectPanelByName(path);
	},

	placeChanged: function(oldPlace, newPlace) {
		this.startJob('reload', 'reload', 500);
	},

	reload: function() {
		var place = this.get('place');
		var store = this.createStore();
		
		if(place) {
			var l = store.createRecord(cumulus.models.LocalForecast,{location: this.get('place'), name: 'test'});
			l.fetch({params:{extend:"hourly"}});
			this.set('localForecast', l);
		}
		else {
			this.set('localForecast', null);
		}
	},

	titleChanged: function(sender, event) {
		document.title = event.title;
	},

	onBackButton: function(sender,event) {
		if(this.$.panels.getIndex()) {
			history.back();

			if(event.stopPropagation)
				event.stopPropagation();
			if(event.preventDefault) 
				event.preventDefault();
		}
	},

	retryGeolocation: function() {
		this.$.locationErrorPopup.hide();
		app.geolocate();
	},

	useSavedLocation: function() {
		this.$.locationErrorPopup.hide();
		this.routeToPreferences();

		setTimeout(this.settings.set.bind(this.settings, 'usePlace', 0), 750);
	},

	routeToPreferences: function() {
		window.location.hash = 'preferences';
	},

	routeToAbout: function() {
		window.location.hash = 'about';
	},

	obscuredChanged: function(oldValue, newValue) {
		this.addRemoveClass("obscured",newValue);
	},

	receivedAPIError: function(sender, event) {
		this.$.errorDescription.setContent(event.error.description);
		this.$.errorPopup.show();
	},

	toggleAppMenu: function() {
		if(this.$.appmenu.getShowing())
			this.$.appmenu.hide();
		else
			this.$.appmenu.show();
	}
});
