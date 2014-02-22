enyo.kind({
	name: 'Cumulus.models.Base',
	kind: 'enyo.Model',
	defaultSource: 'forecast',
	primaryKey: 'time',

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
	name: 'Cumulus.models.Daily',
	kind: 'Cumulus.models.Base',

	parse: function(data) {
		var x = this.inherited(arguments);
		x.hourly = new Cumulus.collections.Hourly(data.hourly);
		x.hourly.set('time',x.time);
		//TODO: deserialize array into collection, if needed.
		return x;
	},

	timeString: function() {
		var value = this.get('time');

		if(value) {
			var date = new Date(value);

			return Cumulus.Main.formatDay(date);
		}

		return value;
	}
});

enyo.kind({
	name: 'Cumulus.models.Hourly',
	kind: 'Cumulus.models.Base',

	timeString: function() {
		return $L("TIMESTRING");
	}
});

enyo.kind({
	name: 'Cumulus.models.Currently',
	kind: 'Cumulus.models.Base',

	timeString: function() {
		return $L("now");
	}
});

enyo.kind({
	name: 'Cumulus.models.Condition',
	kind: 'enyo.Model',

	mixins:[ enyo.ComputedSupport ],

	computed:{
		timespan: ['start', 'end', {cached: true}]
	},

	timespan: function() {
		return Cumulus.Main.formatTime(new Date(this.get('start'))) + ' - ' + Cumulus.Main.formatTime(new Date(this.get('end')));
	}
});
