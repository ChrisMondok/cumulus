enyo.kind({
	name: 'Cumulus.models.LocalForecast',
	kind: 'Cumulus.models.Base',
	primaryKey: 'latlng',
	defaultSource: 'forecast',

	url: 'forecast/'+window.forecastIOKey,

	computed:{
		latlng:['coords',{cached: true}]
	},

	latlng: function() {
		console.log("Compute latlng");
		var coords = this.get('coords');
		if(coords)
			return [coords.latitude,coords.longitude].join(',');
		debugger;
		return null;
	},

	attributes:{
		name: null,
		coords: null,
		currently: null,
		daily: null,
		alerts: null,
		latlng: null
	},

	parse: function(data) {
		data.currently = data.currently && new Cumulus.models.Currently(data.currently) || null;
		if(data.hourly && data.daily)
			this.parseHours(data);
		data.daily = new Cumulus.collections.Daily(data.daily && data.daily.data || []);
		return data;
	},

	parseHours: function(response) {
		var hour = null, day = null;

		var di = response.daily.data.length, hi = response.hourly.data.length;

		var nextHour = function() {
			hi--;
			hour = response.hourly.data[hi];
		};

		var nextDay = function() {
			di--;
			day = response.daily.data[di];
			day.hourly = day.hourly || [];
		};

		nextDay();
		nextHour();

		while(day && hour) {
			if(hour.time < day.time)
				nextDay();
			else {
				day.hourly.push(hour);
				nextHour();
			}
		}

		if(hi != -1)
			throw "Extra hourly forecasts";
	}
});
