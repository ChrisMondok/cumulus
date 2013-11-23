enyo.kind({
	name:"Cumulus.Preferences",
	classes:"preferences onyx",

	statics:{
		reloadInterval:30,

		getGeoDistance:function(latitude, longitude, targetlat, targetlon) {

			var degToRad = function(degrees) {
				return (degrees/180)*Math.PI;
			};

			var earthRadius = 6371,
				lat1 = degToRad(latitude),
				lon1 = degToRad(longitude),
				lat2 = degToRad(targetlat),
				lon2 = degToRad(targetlon),
				dLat = lat2 - lat1,
				dLon = lon2 - lon1;

			var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)*Math.sin(dLon/2);
			var c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
			var distanceInKm = earthRadius*c;
			return Math.round(distanceInKm*62.1371)/100;
		}
	},

	published:{
		api:null,
		settings:null,
		place:null
	},

	components:[
		{kind:"Scroller", classes:"prefs-scroller", style:"height:100%", thumb:false, horizontal:"hidden", components:[
			{kind:"onyx.Groupbox", components:[
				{kind:"onyx.GroupboxHeader", content:"Saved Locations"},
				{kind:"Group", onActivate:"placeGroupActivated", tag:null, components:[
					{kind:"onyx.Item", components:[
						{name:"useGPSButton", kind:"onyx.Checkbox", content:"Use GPS", index:false}
					]},
					{name:"locationRepeater", tag:null, onSetupItem:"renderLocation", kind:"enyo.Repeater", components:[
						{kind:"onyx.Item", components:[
							{name:"locationCheckbox", kind:"onyx.Checkbox", components:[
								{name:"locationName", style:"float:left"},
								{name:"locationDistance", classes:"label", style:"float:right", content:"2 miles"}
							]}
						]}
					]}
				]},
				{kind:"onyx.Item", components:[
					{name:"savePlaceButton", kind:"onyx.IconButton", src:"assets/icons/add.png", ontap:"showSavePopup", disabled:true, content:"Save this location"}
				]}
			]},
			{kind:"onyx.Groupbox", components:[
				{kind:"onyx.GroupboxHeader", content:"Automatically reload"},
				{kind:"onyx.Item", components:[
					{name:"reloadIntervalSlider", kind:"onyx.Slider", min:0, max:60, increment:10, onChanging:"updateReloadIntervalDisplay", onChange:"setReloadInterval"}
				]},
				{name:"reloadIntervalDisplay", kind:"onyx.Item", content:"N minutes"}
			]},
			//{kind:"onyx.Button", classes:"row-button", content:"Micro manage"},
			{classes:"groupbox", components:[
				{name:"clearCacheButton", kind:"onyx.Button", classes:"onyx-negative row-button", content:"Reset Cache"},
				{kind:"onyx.Button", classes:"onyx-negative row-button", content:"Reset Everything", ontap:"promptResetEverything"}
			]},
			{classes:"command-menu-placeholder"},

			{name:"resetEverythingPopup", kind:"onyx.Popup", controlClasses:"with-vertical-margin", centered:true, scrim:true, floating:true, modal:true, components:[
				{content:$L("This action cannot be undone")},
				{kind:"onyx.Button", content:$L("Cancel"), classes:"row-button", ontap:"closeResetEverythingPopup"},
				{kind:"onyx.Button", content:$L("Reset Everything"), classes:"onyx-negative row-button", ontap:"actuallyResetEverything" }
			]},

			{name:"savePopup", kind:"onyx.Popup", centered:true, scrim:true, floating:true, modal:true, components:[
				{content:$L("Where are you?")},
				{kind:"onyx.InputDecorator", components:[
					{name:"placeNameInput", kind:"onyx.Input"}
				]},
				{kind:"onyx.Button", classes:"onyx-blue row-button", content:"Save", ontap:"addPlace"}
			]}
		]}
	],

	create:function() {
		this.inherited(arguments);
		this.apiChanged();
		this.loadSettings();
		window.S = this;
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

		if(settings[setting] === value)
			return;

		settings[setting] = value;
		this.settingsChanged();
		this.startJob("saveSettings","saveSettings",1000);
	},

	showSavePopup:function() {
		this.$.savePopup.show();
	},

	saveSettings:function() {
		localStorage.setItem("settings",JSON.stringify(this.getSettings()));
		webosCompatibility.showBanner("Settings saved");
	},

	loadSettings:function() {
		var loaded = localStorage.getItem('settings');
		this.setSettings(JSON.parse(loaded) || this.getDefaultSettings());
	},

	settingsChanged:function() {
		var settings = this.getSettings();

		enyo.Signals.send("onSettingsChanged",settings);
		
		this.$.reloadIntervalSlider.setValue(settings.reloadInterval);
		this.updateReloadIntervalDisplay();

		this.updateLocationDisplay();
	},

	getDefaultSettings:function() {
		return {
			reloadInterval: 0,
			places:[
				{name:"Neptune", latitude:40.220391, longitude:-74.012082},
				{name:"Long Valley", latitude:40.78225, longitude:-74.776936}
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
		webosCompatibility.showBanner("All data erased.");
		this.loadSettings();
	},

	placeChanged:function(old, place) {
		this.$.locationRepeater.build();
		this.$.savePlaceButton.setDisabled(!place);
	},

	renderLocation:function(sender, event) {
		var item = event.item,
			index = event.index,
			settings = this.getSettings(),
			place = settings.places[index],
			currentLocation = this.getPlace();

		item.$.locationName.setContent(place.name);
		item.$.locationCheckbox.setActive(index === settings.usePlace);
		item.$.locationCheckbox.index = index;
		item.$.locationDistance.setContent(currentLocation
			? Cumulus.Preferences.getGeoDistance(currentLocation.latitude, currentLocation.longitude, place.latitude, place.longitude) +"mi"
			: ""
			);
	},

	addPlace:function() {
		var places = this.getSettings().places.slice(),
			loc = this.getPlace();

		places.push({
			name:this.$.placeNameInput.getValue(),
			latitude:loc.latitude,
			longitude:loc.longitude
		});

		this.$.savePopup.hide();
		this.setSetting("places",places);
	}
});
