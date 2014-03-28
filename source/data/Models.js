enyo.kind({
	name: 'cumulus.models.Base',
	kind: 'enyo.Model',
	defaultSource: 'forecast',
	primaryKey: 'time',
	readOnly: true,

	mixins:[ enyo.ComputedSupport ],

	computed:{
		hasTempRange:['temperatureMax', 'temperatureMin', {cached: true}],
		hasCurrentTemp: ['temperature', {cached: true}],
		apparentTempIsInteresting: ['temperature', 'apparentTemperature', {cached: true}],
		timeString: ['time', {cached: true}]
	},

	hasCurrentTemp: function() {
		return typeof this.get('temperature') == 'number';
	},

	hasTempRange: function() {
		return typeof this.get('temperatureMax') == 'number' && typeof this.get('temperatureMin') == 'number';
	},

	apparentTempIsInteresting: function() {
		var a = this.get('apparentTemperature');
		var t = this.get('temperature');

		if (typeof a == 'number' && typeof t == 'number')
			return Math.abs(a-t) > 3;
		return false;
	},

	parse: function(data) {
		var x = this.inherited(arguments);
		for(var key in x) {
			if(key == 'time' || (key.lastIndexOf('Time') == key.length - 4)) {
				if(x[key] < 1000000000000)
					x[key] *= 1000;
			}
		}
		return x;
	},

	getUrl: function() {
		var base = this.inherited(arguments);
		var time = this.get('time');
		if(time)
			return [base,time].join(',');
		return base;
	}
});

enyo.kind({
	name: 'cumulus.models.Daily',
	kind: 'cumulus.models.Base',

	parse: function(data) {
		var x = this.inherited(arguments);
		x.hourly = this.store.createCollection(cumulus.collections.Hourly, data.hourly);
		x.hourly.set('time',x.time);
		//TODO: deserialize array into collection, if needed.
		return x;
	},

	timeString: function() {
		var value = this.get('time');

		if(value) {
			var date = new Date(value);

			return cumulus.Utils.formatDay(date);
		}

		return value;
	}
});

enyo.kind({
	name: 'cumulus.models.Hourly',
	kind: 'cumulus.models.Base',

	timeString: function() {
		return $L("TIMESTRING");
	}
});

enyo.kind({
	name: 'cumulus.models.Currently',
	kind: 'cumulus.models.Base',

	timeString: function() {
		return $L("now");
	}
});

enyo.kind({
	name: 'cumulus.models.Condition',
	kind: 'enyo.Model',

	mixins:[ enyo.ComputedSupport ],

	computed:{
		timespan: ['start', 'end', {cached: true}]
	},

	timespan: function() {
		return cumulus.Utils.formatTime(new Date(this.get('start'))) + ' - ' + cumulus.Utils.formatTime(new Date(this.get('end')));
	}
});

enyo.kind({
	name: 'cumulus.models.Settings',
	kind: 'enyo.Model',
	defaultSource: 'localStorage',
	includeKeys:['reloadInterval', 'places', 'useGPS', 'usePlace'],

	statics:{
		defaultSettings:{
			reloadInterval: 0,
			places:[
				{name: 'Neptune', latitude:40.220391, longitude:-74.012082},
				{name: 'Long Valley', latitude:40.78225, longitude:-74.776936}
			],
			useGPS: true
		}
	},

	observers:{
		useGPSChanged: ['useGPS']
	},

	useGPSChanged: function(old, useGPS) {
		if(useGPS || this.get('places').length == 0)
			this.set('usePlace', -1);
		else
			this.set('usePlace', 0);
	},

	constructor: function() {
		this.inherited(arguments);

		var saveIfDirty = function() {
			if(this.dirty)
				this.commit();
		}.bind(this);

		var observer = function(old, value, property) {
			enyo.job(this.euid + '-save', saveIfDirty, 1000);
		}

		this.includeKeys.forEach(function(key) {
			this.addObserver(key, observer, this);
		}, this);

		this.silence();
		this.set('id', 'settings');
		this.dirty = false;
		this.unsilence();
	},

	parse: function(data) {
		if(data) {
			for(var key in data) {
				if(data[key] instanceof Array)
					data[key] = new enyo.Collection(data[key]);
			}

			return data;
		}
	},

	didFail: function(command, record, options, result) {
		//We can't just use "defaults" here, since places is a collection (not an array).
		this.setObject(this.parse(this.ctor.defaultSettings));
		this.dirty = false;
		this.isNew = true;
	}
});
