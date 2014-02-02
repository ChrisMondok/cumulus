enyo.kind({
	name: 'Cumulus.models.Base',
	kind: 'enyo.Model',
	defaultSource: 'forecast',
	primaryKey: 'time',

	mixins:[ enyo.ComputedSupport ],

	computed:{
		hasTempRange:['temperatureMax', 'temperatureMin', {cached: true}],
		hasCurrentTemp: ['temperature', {cached: true}],
		apparentTempIsInteresting: ['temperature', 'apparentTemperature', {cached: true}]
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
		if(x.time < 1000000000000)
			x.time *= 1000;
		return x;
	}
});

enyo.kind({
	name: 'Cumulus.models.Daily',
	kind: 'Cumulus.models.Base',

	attributes:{
		hasTempRange: true
	},

	parse: function(data) {
		var x = this.inherited(arguments);
		x.hourly = new Cumulus.collections.Hourly(data.hourly);
		//TODO: deserialize array into collection, if needed.
		return x;
	}
});

enyo.kind({
	name: 'Cumulus.models.Hourly',
	kind: 'Cumulus.models.Base'
});

enyo.kind({
	name: 'Cumulus.models.Currently',
	kind: 'Cumulus.models.Base'
});

