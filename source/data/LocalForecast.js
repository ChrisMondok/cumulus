(function() {
	var parseHours = function(response) {
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
				day.hourly.unshift(hour);
				nextHour();
			}
		}

		if(hi != -1)
			throw "Extra hourly forecasts";
	};

	enyo.kind({
		name: 'Cumulus.models.LocalForecast',
		kind: 'Cumulus.models.Base',
		primaryKey: 'latlng',
		defaultSource: 'forecast',

		computed:{
			latlng:['coords',{cached: true}]
		},

		latlng: function() {
			var coords = this.get('coords');
			if(coords)
				return [coords.latitude,coords.longitude].join(',');
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
			if(data.hourly && data.daily) {
				parseHours(data);
				delete data.hourly;
			}
			data.daily = new Cumulus.collections.Daily(data.daily && data.daily.data || []);
			return data;
		}
	});
})();
