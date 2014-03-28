enyo.kind({
	name: 'cumulus.Preferences',
	classes: 'preferences onyx',

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
		settings:null,
		currentLocation:null
	},

	bindings:[
		{from: '.app.settings', to: '.settings'},
		{from: '.settings.places', to: '.$.locationRepeater.collection'},
		{from: '.settings.useGPS', to: '.$.gpsGroup.active', oneWay: false, transform: function(value, direction) {
			if(direction == "source")
				return this.$.gpsGroup.controlAtIndex(value ? 0 : 1);
			else
				return this.$.gpsGroup.active.indexInContainer() === 0;
		}},
		{from: '.settings.useGPS', to: '.$.locationDrawer.open', kind: 'enyo.InvertBooleanBinding'},
		{from: '.settings.useGPS', to: '.$.savePlaceDrawer.open', kind: 'enyo.BooleanBinding'},
		{from: '.settings.usePlace', to: '.usePlace'},
		{from: '.settings.reloadInterval', to: '.$.reloadIntervalSlider.value', oneWay: false},
		{from: '.settings.reloadInterval', to: '.$.reloadIntervalDisplay.content', transform: function(interval) {
			if(interval)
				return [interval,$L("minutes")].join(' ');
			else
				return $L("Manually");
		}},
		{from: '.$.locationRepeater.selected', to: '.settings.usePlace', transform: function(selectedPlace) {
			var index = this.settings.get('places').records.indexOf(selectedPlace);
			if(index != -1)
				return index;
			return null;
		}}
	],

	components:[
		{kind: 'Scroller', classes: 'prefs-scroller', style: 'height:100%', thumb:false, horizontal: 'hidden', components:[
			{kind: 'onyx.Groupbox', components:[
				{kind: 'onyx.GroupboxHeader', content: 'Location'},
				{kind: 'onyx.Item', components:[
					{name: 'gpsGroup', kind: 'onyx.RadioGroup', classes: 'two-button-radio-group', components:[
						{content: 'GPS'},
						{content: 'Saved'}
					]},
				]},
				{name: 'locationDrawer', kind: 'enyo.Drawer', components:[
					{name: 'locationRepeater', kind: 'enyo.DataRepeater', components:[
						{kind: 'onyx.Item', style: 'overflow: hidden', components:[
							{name: 'name', style: 'float: left'},
							{name: 'distance', classes: 'label', style: 'float: right',  content: 'x miles'}
						], bindings:[
							{from: '.model.name', to: '.$.name.content'}
						]}
					]},
				]},
				{name: 'savePlaceDrawer', kind: 'enyo.Drawer', components:[
					{kind: 'onyx.Item', components:[
						{name: 'savePlaceButton', kind: 'onyx.IconButton', src: 'assets/icons/add.png', ontap: 'showSavePopup', disabled:true, content: 'Save this location'}
					]}
				]}
			]},
			{kind: 'onyx.Groupbox', components:[
				{kind: 'onyx.GroupboxHeader', content: 'Automatically reload'},
				{kind: 'onyx.Item', components:[
					{name: 'reloadIntervalSlider', kind: 'onyx.Slider', min:0, max:60, increment:10, onChanging: 'updateReloadIntervalDisplay', onChange: 'setReloadInterval'}
				]},
				{name: 'reloadIntervalDisplay', kind: 'onyx.Item', content: $L('Manually')}
			]},
			//{kind: 'onyx.Button', classes: 'row-button', content: 'Micro manage'},
			{classes: 'groupbox', components:[
				{name: 'clearCacheButton', kind: 'onyx.Button', classes: 'onyx-negative row-button', content: 'Reset Cache'},
				{kind: 'onyx.Button', classes: 'onyx-negative row-button', content: 'Reset Everything', ontap: 'promptResetEverything'}
			]},

			{name: 'resetEverythingPopup', kind: 'onyx.Popup', controlClasses: 'with-vertical-margin', centered:true, scrim:true, floating:true, modal:true, components:[
				{content:$L('This action cannot be undone')},
				{kind: 'onyx.Button', content:$L('Cancel'), classes: 'row-button', ontap: 'closeResetEverythingPopup'},
				{kind: 'onyx.Button', content:$L('Reset Everything'), classes: 'onyx-negative row-button', ontap: 'actuallyResetEverything' }
			]},

			{name: 'savePopup', kind: 'onyx.Popup', centered:true, scrim:true, floating:true, modal:true, components:[
				{content:$L('Where are you?')},
				{kind: 'onyx.InputDecorator', components:[
					{name: 'placeNameInput', kind: 'onyx.Input'}
				]},
				{kind: 'onyx.Button', classes: 'onyx-blue row-button', content: 'Save', ontap: 'addPlace'}
			]}
		]}
	],

	usePlaceChanged: function(oldPlace, newPlace) {
		if(typeof(oldPlace) == 'number')
			this.$.locationRepeater.deselect(oldPlace);

		if(typeof(newPlace) == 'number')
			this.$.locationRepeater.select(newPlace);
	},

	showingChanged:function(wasShowing, isShowing) {
		if(!isShowing)
			this.$.resetEverythingPopup.hide();
		this.inherited(arguments);
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
		webosCompatibility.showBanner('All data erased.');
		this.loadSettings();
	},

	addPlace:function() {
		var places = this.getSettings().places.slice(),
			loc = this.get('currentLocation');

		places.push({
			name:this.$.placeNameInput.getValue(),
			latitude:loc.latitude,
			longitude:loc.longitude
		});

		this.$.savePopup.hide();
		this.setSetting('places',places);
	}
});
