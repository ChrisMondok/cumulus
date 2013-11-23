enyo.kind({
	name: "Cumulus.Main",
	classes:"onyx",

	published:{
		api:null,
		place:null
	},

	handlers:{
		onDayPicked:"pushDayPickedState",
		onAdvisoryPicked:"pushShowAdvisoryState",
		onReceivedAPIError:"receivedAPIError"
	},

	components:[
		{kind:"Signals", onBackButton:"onBackGesture", onToggleAppMenu:"toggleAppMenu"},
		{content:"Beta", classes:"sash"},
		{name:"appmenu", kind:"Cumulus.Appmenu", components:[
			{content:"Preferences", ontap:"pushPreferencesState"},
			{content:"About", ontap:"showAbout"}
		]},
		{name:"panels", kind:"Panels", arrangerKind:"CardArranger", classes:"enyo-fit", draggable:false, onTransitionFinish:"panelIndexChanged", components:[
			{ name:"outlook", kind:"Cumulus.Outlook" },
			{ name:"detail", kind:"Cumulus.Detail" },
			{ name:"advisory", kind:"Cumulus.Advisory" },
			{ name:"preferences", kind:"Cumulus.Preferences" }
		]},
		{name:"commandMenu", kind:"Cumulus.CommandMenu", components:[
			{name:"backButton", kind:"onyx.IconButton", src:"assets/icons/back.png", ontap:"back"}
		]},
		{
			name:"locatingPopup",
			kind:"onyx.Popup",
			centered:true,
			modal:true,
			floating:true,
			scrim:true,
			autoDismiss:false,
			scrimWhenModal:true,
			components:[
				{content:"Getting your current location"}
			]
		},
		{ kind:"Cumulus.AboutPopup" },
		{
			name:"errorPopup",
			kind:"onyx.Popup",
			centered:true, floating:true, modal:true, scrim:true, scrimWhenModal:true,
			components:[
				{tag:"h1", content:"Error"},
				{name:"errorDescription"}
			]
		}
	],

	statics:{
		formatTime:function(date) {
			var hour = date.getHours() % 12;
			if(!hour)
				hour = 12;
			var minutes = date.getMinutes();
			if(minutes < 10)
				minutes = "0"+minutes;
			var ampm = ["AM","PM"][Math.floor(date.getHours()/12)];
			return hour+":"+minutes+" "+ampm;
		},
		formatDay:function(date) {
			date.setHours(0,0,0,0);

			var today = new Date();
			today.setHours(0,0,0,0);

			if(today - date === 0)
				return $L("today");
			else
				return $L(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()]);
		}
	},

	create:function() {
		this.inherited(arguments);

		this.setApi(new Cumulus.API.ForecastIO);

		this.calculateCommandMenu();

		window.addEventListener('popstate',enyo.bind(this,'stateChanged'));
		window.INSTANCE = this;

		if(!history.pushState)
			this.state = [];
	},

	rendered:function() {
		this.inherited(arguments);
		this.stateChanged();

		onyx.scrim.make().addObserver("showing",this.obscuredChanged, this);

		this.$.locatingPopup.show();
		Service.Geolocation.getLocation()
			.response(enyo.bind(this, function(sender,response) {
				this.$.locatingPopup.hide();
				this.setPlace(response);
			}))
			.error(enyo.bind(this, function(sender,error) {
				this.$.locatingPopup.hide();
				this.$.gpsFailureReason.setContent(error.message);
			}));

		enyo.Signals.send("onStageReady");
	},

	apiChanged:function() {
		this.waterfall("onApiCreated",{api:this.getApi()},this);
	},

	placeChanged:function(oldPlace, newPlace) {
		if(newPlace) {
			this.$.outlook.setPlace(newPlace);
			this.$.detail.setPlace(newPlace);
			this.$.preferences.setPlace(newPlace);
		}
	},

	pushState:function(state, title, url) {
		if(history.pushState)
			history.pushState(state,title,url);
		else
			this.state.push(state);
		this.stateChanged();
	},

	pushDayPickedState:function(sender,event) {
		this.pushState({day:event.day, top:event.top, index:1}, "Hourly Forecast");
	},

	pushShowAdvisoryState:function(sender,event) {
		this.pushState({advisory:event.advisory, index:2}, event.advisory.title);
	},

	pushPreferencesState:function(sender, event) {
		this.pushState({index:3},"Preferences");
	},

	onBackGesture:function(sender,event) {
		if(this.$.panels.getIndex()) {
			this.back();
			event.stopPropagation();
			event.preventDefault();
			return -1;
		}
	},

	back:function(sender,event) {
		if(history.pushState)
			history.back();
		else {
			this.state.pop();
			this.stateChanged();
		}
	},

	stateChanged:function() {
		var state;
		if(history.pushState)
			state = history.state;
		else
			state = this.state[this.state.length-1];

		switch(state && state.index || 0) {
			case 1:
				this.$.panels.setIndex(1);
				this.$.detail.setDay(new Date(state.day));
				break;
			case 2:
				this.$.advisory.setAdvisory(state.advisory);
				break;
			default:
				break;
		}

		if(state && state.index)
			this.$.panels.setIndex(state.index);
		else
			this.$.panels.setIndex(0);
	},

	panelIndexChanged:function() {
		if(this.$.panels.getIndex() != 1) {
			this.$.detail.setDay(null);
		}
		this.$.backButton.setDisabled(this.$.panels.getIndex() === 0);
	},

	calculateCommandMenu:function() {
		var needsBackButton = true;

		if(window.PalmSystem)
			needsBackButton = !JSON.parse(window.PalmSystem.deviceInfo).keyboardAvailable;

		this.addRemoveClass("show-command-menu",needsBackButton); //hide this when there's a native back button
	},

	obscuredChanged:function(oldValue, newValue, property) {
		if(property != "showing")
			alert("Property is "+property+", not showing!");
		else
			this.addRemoveClass("obscured",newValue);
	},

	receivedAPIError:function(sender, event) {
		this.$.errorDescription.setContent(event.error.description);
		this.$.errorPopup.show();
	},

	showAbout:function() {
		this.$.aboutPopup.show();
	},

	toggleAppMenu:function() {
		if(this.$.appmenu.getShowing())
			this.$.appmenu.hide();
		else
			this.$.appmenu.showAtPosition({top:0, left:0});
	}
});
