enyo.kind({
	name:"Cumulus.Preferences",
	defaultKind:"onyx.Groupbox",
	classes:"onyx",
	controlClasses:"with-vertical-margin",
	style:"padding: 0 15px;",

	statics:{
		reloadInterval:30
	},

	published:{
		api:null
	},

	components:[
		{components:[
			{kind:"onyx.GroupboxHeader", content:"Saved Locations"},
			{kind:"onyx.Item", content:"Saved items go here"}
		]},
		{components:[
			{kind:"onyx.GroupboxHeader", content:"Automatically reload"},
			{kind:"onyx.Item", components:[
				{kind:"onyx.Slider", min:0, max:5, increment:1, onChanging:"updateReloadIntervalDisplay", onChange:"setReloadInterval"}
			]},
			{name:"reloadIntervalDisplay", kind:"onyx.Item", content:"N minutes"}
		]},
		{kind:"onyx.Button", classes:"row-button", content:"Micro manage"},
		{name:"clearCacheButton", kind:"onyx.Button", classes:"onyx-negative row-button", content:"Reset Cache"},
		{kind:"onyx.Button", classes:"onyx-negative row-button", content:"Reset Everything", ontap:"promptResetEverything"},

		{name:"resetEverythingPopup", kind:"onyx.Popup", controlClasses:"with-vertical-margin", centered:true, scrim:true, floating:true, modal:true, components:[
			{content:$L("This action cannot be undone")},
			{kind:"onyx.Button", content:$L("Cancel"), classes:"row-button", ontap:"closeResetEverythingPopup"},
			{kind:"onyx.Button", content:$L("Reset Everything"), classes:"onyx-negative row-button", ontap:"actuallyResetEverything" }
		]}
	],

	create:function() {
		this.inherited(arguments);
		this.apiChanged();
	},

	showingChanged:function(wasShowing, isShowing) {
		if(!isShowing)
			this.$.resetEverythingPopup.hide();
		this.inherited(arguments);
	},

	updateReloadIntervalDisplay:function(slider,event) {
		var minutes = (event.value+1)*10;
		if(minutes <= 60)
			this.$.reloadIntervalDisplay.setContent([minutes,$L("minutes")].join(' '));
		else
			this.$.reloadIntervalDisplay.setContent($L("Manually"));
	},

	setReloadInterval:function(slider, event) {
		this.updateReloadIntervalDisplay(slider,event);
		var minutes = (event.value+1)*10;
		if(minutes > 60)
			minutes = 0;
		Cumulus.Settings.reloadInterval = minutes;
		this.setSetting("reloadInterval", minutes);
	},

	apiChanged:function() {
		this.$.clearCacheButton.setDisabled(!this.getApi());
	},

	setSetting:function(setting, value) {
		Cumulus.Settings[setting] = value;
		enyo.Signals.send("settingChanged",{setting:setting, value:value});
		this.startJob("saveSettings","saveSettings");
	},

	saveSettings:function() {
		localStorage.setItem("settings",JSON.stringify(Cumulus.Settings));
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
	}
});
