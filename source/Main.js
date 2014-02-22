enyo.kind({
	name: "Cumulus.Main",
	classes: "onyx",

	published: {
		place: null,
		localForecast: null
	},

	bindings: [
		{from: '.localForecast', to: '.$.outlook.forecast'},
		{from: '.localForecast', to: '.$.detail.forecast'}
	],

	components: [
		{kind: "Router", useHistory: true, triggerOnStart: false, routes:[
			{path: 'outlook', handler: 'showOutlook', context: 'owner', default: true},
			{path: 'detail/:time', handler: 'showDetail', context: 'owner'}
		]},
		{kind: "Signals", onBackButton: "onBackGesture", onToggleAppMenu: "toggleAppMenu", onSettingsChanged: "settingsChanged"},
		{content: "Beta", classes: "sash"},
		{name: "appmenu", kind: "Cumulus.Appmenu", components: [
			{content: "Preferences"},
			{content: "About", ontap: "showAbout"}
		]},
		{name: "panels", kind: "Panels", arrangerKind: "CardArranger", classes: "enyo-fit", draggable: false, onTransitionFinish: "panelIndexChanged", components: [
			{ name: "outlook", kind: "Cumulus.Outlook" },
			{ name: "detail", kind: "Cumulus.Detail" },
			{ name: "advisory", kind: "Cumulus.Advisory" },
			{ name: "preferences", kind: "Cumulus.Preferences" }
		]},
		{name: "commandMenu", kind: "Cumulus.CommandMenu", components: [
			{name: "backButton", kind: "onyx.IconButton", src: "assets/icons/back.png", ontap: "back"}
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
		{ kind: "Cumulus.AboutPopup" },
		{
			name: "errorPopup",
			kind: "onyx.Popup",
			centered: true, floating: true, modal: true, scrim: true, scrimWhenModal: true,
			components: [
				{tag: "h1", content: "Error"},
				{name: "errorDescription"}
			]
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

		enyo.store.addSources({forecast: ForecastSource});

		this.calculateCommandMenu();

		window.INSTANCE = this;
	},

	rendered: function() {
		this.inherited(arguments);

		onyx.scrim.make().addObserver("showing",this.obscuredChanged, this);

		this.$.locatingPopup.show();
		Service.Geolocation.getLocation()
			.response(enyo.bind(this, function(sender,response) {
				this.$.locatingPopup.hide();
				this.setPlace(response);
			}))
			.error(enyo.bind(this, function(sender,error) {
				this.$.locatingPopup.hide();
				this.$.errorPopup.show();
				this.$.errorDescription.setContent(error.message);
			}));

		enyo.Signals.send("onStageReady");
	},

	showOutlook: function() {
		this.$.panels.selectPanelByName('outlook');
	},

	showDetail: function(time) {
		this.$.panels.selectPanelByName('detail');
	},

	apiChanged: function() {
		this.waterfall("onApiCreated",{api: this.getApi()},this);
	},

	placeChanged: function(oldPlace, newPlace) {
		if(newPlace) {
			var source = new ForecastSource();
			var l = new Cumulus.models.LocalForecast({coords: newPlace, name: 'test'});
			this.set('localForecast', l);
			l.fetch({success: function(){console.log("DONE")}});
			window.l = l;
		}
	},

	onBackGesture: function(sender,event) {
		if(this.$.panels.getIndex()) {
			this.back();
			event.stopPropagation();
			event.preventDefault();
			return -1;
		}
	},

	back: function(sender,event) {
		history.back();
	},

	panelIndexChanged: function() {
		this.$.backButton.setDisabled(this.$.panels.getIndex() === 0);
	},

	calculateCommandMenu: function() {
		var needsBackButton = true;

		if(window.PalmSystem)
			needsBackButton = !JSON.parse(window.PalmSystem.deviceInfo).keyboardAvailable;

		this.addRemoveClass("show-command-menu",needsBackButton); //hide this when there's a native back button
	},

	obscuredChanged: function(oldValue, newValue, property) {
		if(property != "showing")
			alert("Property is "+property+", not showing!");
		else
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
