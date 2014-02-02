enyo.kind({
	name: 'Cumulus.models.Base',
	kind: 'enyo.Model',
	defaultSource: 'forecast',
	primaryKey: 'time'
});

enyo.kind({
	name: 'Cumulus.models.Daily',
	kind: 'Cumulus.models.Base',

	parse: function(data) {
		var x = this.inherited(arguments);
		//TODO: deserialize array into collection, if needed.
		if(!x.hourly)
			x.hourly = new Cumulus.collections.Hourly;
		return x;
	}
});

enyo.kind({
	name: 'Cumulus.models.Hourly',
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

enyo.kind({
	name: 'Cumulus.models.LocalForecast',
	kind: 'Cumulus.models.Base',
	primaryKey: 'latlng',
	defaultSource: 'forecast',

	url: 'forecast/'+window.forecastIOKey,

	observers:{
		coordsChanged: ['coords']
	},

	coordsChanged: function(old, coords) {
		this.set('latlng',[coords.latitude,coords.longitude].join(','));
	},

	attributes:{
		name: null,
		coords: null,
		daily: null,
		alerts: null,
		latlng: null
	},

	constructor: function() {
		var x = this.inherited(arguments);
		this.set('daily',new Cumulus.collections.Daily);
		this.set('alerts', new enyo.Collection);
		return x;
	},

	parse: function(response) {
		var dc = this.get('daily');
		dc.add(response.daily.data);
		var hi = response.hourly.data.length - 1, di = dc.length - 1;
		var day = dc.at(di);
		while(day && hi > -1) {
			console.log(response.hourly.data[hi].time,day.get('time'));
			if(response.hourly.data[hi].time < day.get('time'))
				day = dc.at(--di);
			else
				day.get('hourly').add(response.hourly.data[hi--]);
		}
	}
});
