enyo.kind({
	name: 'Cumulus.models.Base',
	kind: 'enyo.Model',
	defaultSource: 'forecast',
	primaryKey: 'time',

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
		hasTempRange: false
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

enyo.kind({
	name:'Cumulus.collections.Daily',
	kind: 'enyo.Collection',
	model: 'Cumulus.models.Daily'
});

enyo.kind({
	name: 'Cumulus.collections.Hourly',
	kind: 'enyo.Collection',
	model: 'Cumulus.models.Hourly'
});
