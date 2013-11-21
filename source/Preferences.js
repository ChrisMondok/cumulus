enyo.kind({
	name:"Cumulus.Preferences",
	defaultKind:"onyx.Groupbox",
	classes:"preferences onyx",
	controlClasses:"with-vertical-margin",
	style:"padding: 0 15px;",

	statics:{
		reloadInterval:30
	},

	published:{
		api:null,
		settings:null
	},

	components:[
		{components:[
			{kind:"onyx.GroupboxHeader", content:"Saved Locations"},
			{kind:"Group", onActivate:"placeGroupActivated", tag:null, components:[
				{kind:"onyx.Item", components:[
					{name:"useGPSButton", kind:"onyx.Checkbox", content:"Use GPS", index:false},
				]},
				{name:"locationRepeater", tag:null, onSetupItem:"renderLocation", kind:"enyo.Repeater", components:[
					{kind:"onyx.Item", components:[
						{name:"locationName", kind:"onyx.Checkbox"},
					]}
				]},
			]},
			{kind:"onyx.Item", components:[
				{kind:"onyx.IconButton", src:"assets/icons/add.png", content:"Save this location"},
			]}
		]},
		{components:[
			{kind:"onyx.GroupboxHeader", content:"Automatically reload"},
			{kind:"onyx.Item", components:[
				{name:"reloadIntervalSlider", kind:"onyx.Slider", min:0, max:60, increment:10, onChanging:"updateReloadIntervalDisplay", onChange:"setReloadInterval"}
			]},
			{name:"reloadIntervalDisplay", kind:"onyx.Item", content:"N minutes"}
		]},
		//{kind:"onyx.Button", classes:"row-button", content:"Micro manage"},
		{name:"clearCacheButton", kind:"onyx.Button", classes:"onyx-negative row-button", content:"Reset Cache"},
		{kind:"onyx.Button", classes:"onyx-negative row-button", content:"Reset Everything", ontap:"promptResetEverything"},
		{classes:"command-menu-placeholder"},

		{name:"resetEverythingPopup", kind:"onyx.Popup", controlClasses:"with-vertical-margin", centered:true, scrim:true, floating:true, modal:true, components:[
			{content:$L("This action cannot be undone")},
			{kind:"onyx.Button", content:$L("Cancel"), classes:"row-button", ontap:"closeResetEverythingPopup"},
			{kind:"onyx.Button", content:$L("Reset Everything"), classes:"onyx-negative row-button", ontap:"actuallyResetEverything" }
		]}
	],

	create:function() {
		this.inherited(arguments);
		this.apiChanged();
		this.loadSettings();
	},

	placeGroupActivated:function(sender, event) {
		if(event.originator.getActive()) {
			this.setSetting('usePlace',event.originator.index);
		}
	},

	showingChanged:function(wasShowing, isShowing) {
		if(!isShowing)
			this.$.resetEverythingPopup.hide();
		this.inherited(arguments);
	},

	updateLocationDisplay:function() {
		var settings = this.getSettings();
		this.$.locationRepeater.setCount(settings.places.length);
		this.$.useGPSButton.setActive(settings.usePlace === false);
	},

	updateReloadIntervalDisplay:function(slider,event) {
		var minutes = this.$.reloadIntervalSlider.getValue();
		if(minutes)
			this.$.reloadIntervalDisplay.setContent([minutes,$L("minutes")].join(' '));
		else
			this.$.reloadIntervalDisplay.setContent($L("Manually"));
	},

	setReloadInterval:function(slider, event) {
		this.updateReloadIntervalDisplay(slider,event);
		var minutes = event.value;
		if(minutes > 60)
			minutes = 0;
		this.setSetting("reloadInterval", minutes);
	},

	apiChanged:function() {
		this.$.clearCacheButton.setDisabled(!this.getApi());
	},

	setSetting:function(setting, value) {
		var settings = this.getSettings();

		settings[setting] = value;
		this.settingsChanged();
		this.startJob("saveSettings","saveSettings");
	},

	saveSettings:function() {
		localStorage.setItem("settings",JSON.stringify(this.getSettings()));
	},

	loadSettings:function() {
		var loaded = localStorage.getItem('settings');
		this.setSettings(JSON.parse(loaded) || this.getDefaultSettings());
	},

	settingsChanged:function() {
		var settings = this.getSettings();

		enyo.Signals.send("settingsChanged",settings);
		
		this.$.reloadIntervalSlider.setValue(settings.reloadInterval);
		this.updateReloadIntervalDisplay();

		this.updateLocationDisplay();
	},

	getDefaultSettings:function() {
		return {
			reloadInterval: 0,
			places:[
				{name:"Neptune"},
				{name:"Long Valley"}
			],
			usePlace:false
		};
	},

	promptResetEverything:function() {
		this.$.resetEverythingPopup.show();
	},

	closeResetEverythingPopup:function() {
		this.$.resetEverythingPopup.hide();
	},

	actuallyResetEverything:function() {
		localStorage.clear();
		this.closeResetEverythingPopup();
	},

	renderLocation:function(sender, event) {
		var item = event.item,
			index = event.index,
			settings = this.getSettings(),
			place = settings.places[index];

		item.$.locationName.setContent(place.name);
		item.$.locationName.setActive(index === settings.usePlace);
		item.$.locationName.index = index;
	},
});
