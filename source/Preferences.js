enyo.kind({
	name: 'cumulus.Preferences',
	classes: 'preferences onyx',

	published:{
		settings:null,
		currentLocation:null
	},

	bindings:[
		{from: '.app.settings', to: '.settings'},
		{from: '.settings.places', to: '.$.locationRepeater.collection'},
		{from: '.settings.usePlace', to: '.usePlace', oneWay: false},
		{from: '.usePlace', to: '.$.gpsGroup.active', oneWay: false, allowUndefined: false, transform: function(value, direction, binding) {
			if(direction == "source")
				return this.$.gpsGroup.controlAtIndex(value == -1 ? 0 : 1);
			else {
				if(this.$.gpsGroup.active.indexInContainer())
					return 0;
				return -1;
			}
		}},
		{from: '.usePlace', to: '.$.locationDrawer.open', transform: function(value) {return value != -1;}},
		{from: '.settings.reloadInterval', to: '.$.reloadIntervalSlider.value', oneWay: false},
		{from: '.settings.reloadInterval', to: '.$.reloadIntervalDisplay.content', transform: function(interval) {
			return interval ?
				[interval,$L("minutes")].join(' ') :
				$L("Manually");
		}},
		{from: '.$.locationRepeater.selected', to: '.usePlace', allowUndefined:false, transform: function(selection) {
			if(selection) {
				var index = this.get('settings').get('places').indexOf(selection);
				return index;
			}
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
					]}
				]},
				{name: 'locationDrawer', kind: 'enyo.Drawer', components:[
					{name: 'locationRepeater', kind: 'enyo.DataRepeater', components:[
						{kind: 'onyx.Item', style: 'overflow: hidden', components:[
							{name: 'name', style: 'float: left'},
							{name: 'distance', classes: 'label', style: 'float: right',  content: 'x miles'}
						], bindings:[
							{from: '.model.name', to: '.$.name.content'}
						]}
					]}
				]},
				{kind: 'onyx.Item', components:[
					{name: 'savePlaceButton', kind: 'onyx.IconButton', src: 'assets/icons/add.png', ontap: 'showSavePopup', disabled:true, content: 'Save this location'}
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
		if(isShowing)
			enyo.Signals.send('onTitleChanged', {title:'Preferences'});
		else
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
		app.loadSettings();
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
