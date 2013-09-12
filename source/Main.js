enyo.kind({
	name: "Cumulus.Main",
	classes:"onyx",

	published:{
		api:null
	},

	handlers:{
		onDayPicked:"pushDayPickedState",
		onShowMap:"pushShowMapState"
	},

	components:[
		{kind:"Signals", onBackButton:"onBackGesture", onToggleAppMenu:"toggleAppMenu"},
		{content:"Beta", classes:"sash"},
		{name:"appmenu", kind:"Appmenu", components:[
			{content:"Preferences"},
			{content:"About"}
		]},
		{name:"panels", kind:"Panels", arrangerKind:"CardArranger", classes:"enyo-fit", draggable:false, onTransitionFinish:"panelIndexChanged", components:[
			{ name:"outlook", kind:"Cumulus.Outlook" },
			{ name:"detail", kind:"Cumulus.Detail" },
			{ name:"map", kind:"Cumulus.Map" }
		]},
		{name:"commandMenu", kind:"CommandMenu", components:[
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
			onShow:"obscureMain",
			onHide:"unobscureMain",
			components:[
				{content:"Getting your current location"}
			]
		},
		{name:"getPlacePopup", kind:"onyx.Popup", centered:true, modal:true, floating:true, scrim:true, autoDismiss:false, scrimWhenModal:true, components:[
			{kind:"FittableRows", components:[
				{content:"Please enter your zip code"},
				{name:"gpsFailureReason", style:"color:#AAA"},
				{kind:"onyx.InputDecorator", alwaysLooksFocused:true, components:[
					{name:"placeInput", kind:"onyx.Input"}
				]},
				{kind:"onyx.Button", content:"Submit", classes:"onyx-dark", style:"display:block; width:100%;", ontap:"submitPlace"}
			]}
		]},
	],

	statics:{
		formatTime:function(date) {
			var hour = date.getHours() % 12;
			if(!hour)
				hour = 12;
			var minutes = date.getMinutes();
			if(minutes < 10)
				minutes = "0"+minutes;
			var ampm = ["AM","PM"][Math.floor(date.getHours()/12)]
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

		this.setApi(enyo.create({ kind:"Cumulus.Cache", source:new Cumulus.AerisAPI() }));

		this.calculateCommandMenu();

		window.addEventListener('popstate',enyo.bind(this,'stateChanged'));
		window.INSTANCE = this;

		if(!history.pushState)
			this.state = [];
	},

	toggleAppMenu:function() {
		if(this.$.appmenu.getShowing())
			this.$.appmenu.hide()
		else
			this.$.appmenu.showAtPosition({top:0, left:0});
	},

	submitPlace:function() {
		this.$.getPlacePopup.hide();
		var place = this.$.placeInput.getValue();
		this.$.outlook.setPlace(place);
		this.$.detail.setPlace(place);
		this.$.map.setPlace(place);
	},

	rendered:function() {
		this.inherited(arguments);
		this.stateChanged();

		this.$.locatingPopup.show();
		Service.Geolocation.getLocation()
			.response(enyo.bind(this, function(sender,response) {
				this.$.locatingPopup.hide();
				this.$.outlook.setPlace(response);
				this.$.detail.setPlace(response);
				this.$.map.setPlace(response);
			}))
			.error(enyo.bind(this, function(sender,error) {
				this.$.locatingPopup.hide();
				switch(error.code) {
					case error.PERMISSION_DENIED:
						this.$.gpsFailureReason.setContent("GPS permission denied");
						break;
					case error.POSITION_UNAVAILABLE:
						this.$.gpsFailureReason.setContent("GPS position unavailable");
						break;
					case error.TIMEOUT:
						this.$.gpsFailureReason.setContent("GPS timed out");
						break;
					default:
						this.$.gpsFailureReason.setContent("Unknown geolocation error");
				}
				this.$.getPlacePopup.show();
				this.$.placeInput.focus();
			}));

		onyx.scrim.make().addObserver("showing",this.obscuredChanged, this);

		enyo.Signals.send("onStageReady");
	},

	apiChanged:function() {
		this.waterfall("onApiCreated",{api:this.getApi()},this);
	},

	pushState:function(state, title, url) {
		if(history.pushState) 
			history.pushState(state,title,url)
		else 
			this.state.push(state);
		this.stateChanged();
	},

	pushDayPickedState:function(sender,event) {
		this.pushState({data:event.data, top:event.top, index:1}, "Hourly Forecast");
	},
	pushShowMapState:function(sender,event) {
		this.pushState({data:event.data, index:2}, "Local map");
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

		if(state) {
			switch(state.index) {
				case 1:
					this.showDetail(this,state);
					break;
				case 2:
					this.showMap(this,state);
					break;
			}
		}
		else
			this.$.panels.setIndex(0);
	},

	showDetail:function(sender,event) {
		this.$.panels.setIndex(1);
		this.$.detail.setData(event.data);
	},

	showMap:function(sender,event) {
		this.$.panels.setIndex(2);
	},

	panelIndexChanged:function() {
		if(this.$.panels.getIndex() != 1)
			this.$.detail.setData();
		this.$.backButton.setDisabled(this.$.panels.getIndex() === 0);
	},

	calculateCommandMenu:function() {
		var needsBackButton = true;

		if(window.PalmSystem)
			needsBackButton = !JSON.parse(window.PalmSystem.deviceInfo).keyboardAvailable;

		this.addRemoveClass("show-command-menu",needsBackButton); //hide this when there's a native back button
	},

	obscuredChanged:function(property, oldValue, newValue) {
		if(property != "showing")
			alert("Property is "+property+", not showing!");
		else
			this.addRemoveClass("obscured",newValue);
	}
});
