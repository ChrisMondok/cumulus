enyo.kind({
	name:"Cumulus.API.ForecastIO",
	published:{
		url:"https://api.forecast.io",
		key:undefined
	},
	create:function() {
		this.inherited(arguments);
		if(window.forecastIOKey)
			this.setKey(window.forecastIOKey);
	},
	getForecast:function(loc,time) {
		var params = [loc.latitude, loc.longitude];
		if(time) {
			if(time instanceof Date) 
				params.push(this.formatTime(time));
			else 
				params.push(time);
		}

		var ajax = new enyo.JsonpRequest({
			url:[this.getUrl(),'forecast',this.getKey(),params.join(',')].join('/'),
			cacheBust:false
		});

		ajax.go({exclude:"minutely"}); 

		return ajax;
	},

	formatTime:function(date) {
		return date.toISOString().replace(/\.\d+/,'');
	}
});
