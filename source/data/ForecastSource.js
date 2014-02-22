enyo.kind({
	kind: 'enyo.JsonpSource',
	name: 'ForecastSource',

	urlRoot: 'https://api.forecast.io/forecast/'+window.forecastIOKey,

	buildUrl: function(record, options) {
		var url = this.inherited(arguments);
		var time = record.get('time');
		if(time)
			return url+','+time;
		return url;
	}
});
