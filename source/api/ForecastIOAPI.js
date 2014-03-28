var defaultLifetimes = {
	hourly:60*60*1000, // 1 hour
	daily:4*60*60*1000, // 4 hours
	currently: 30*60*1000, // 30 minutes
	alerts: 6*60*60*1000 // 6 hours
};
enyo.kind({
	name:"cumulus.api.ForecastIO",
	published:{
		url:"https://api.forecast.io",
		key:undefined
	},

	events:{
		onReceivedAPIError:""
	},

	create:function() {
		this.inherited(arguments);
		if(window.forecastIOKey)
			this.setKey(window.forecastIOKey);
	},

	filterStartEnd:function(values,start,end) {
		return values.filter(function(value) {
			if(start && value.time < start)
				return false;
			if(end && value.time > end)
				return false;
			return true;
		});
	},

	getAsync:function(loc,property,time) {
		var params = [loc.latitude, loc.longitude];
			
		if(time) {
			if(time instanceof Date) 
				params.push(this.formatTime(time));
			else 
				params.push(time);
		}

		var url = [this.getUrl(),'forecast',this.getKey(),params.join(',')].join('/');
		ajax =  new enyo.JsonpRequest({
			url:url,
			cacheBust:false
		});

		ajax.go({exclude:"minutely"});

		return ajax;
	},

	getDayThatContainsTime:function(time) {
		var day = new Date(time);
		day.setHours(0,0,0,0);

		var start = day.getTime();

		day.setDate(day.getDate() + 1);
		var end = day.getTime();
		return {start:start, end:end};
	},

	getCurrent:function(loc) {
		return this.getAsync(loc,'currently').response(function(async, data){return data.currently;});
	},

	getAlerts:function(loc) {
		return this.getAsync(loc,'alerts');
	},

	getDailyForecast:function(loc,time) {
		var async;
		if(time) {
			var range = this.getDayThatContainsTime(time);
			async = this.getAsync(loc,'daily',range.start);
		} else
			async = this.getAsync(loc,'daily');

		async.response(function(async, response) {
			return response.daily.data;
		});

		return async;
	},

	getHourlyForecast:function(loc,time) {
		var async,
			range = this.getDayThatContainsTime(time);

		range.end -= 60*60*1000;

		async = this.getAsync(loc,'hourly',range.start,range.end);

		async.response(function(async, response) {
			return response.hourly.data;
		});

		return async;
	},

	getMinutelyForecast:function(loc) {
		var jsonpRequest = new enyo.JsonpRequest({
			url:[this.getUrl(),'forecast',this.getKey(),[loc.latitude,loc.longitude].join(',')].join('/'),
			cacheBust:true
		});

		jsonpRequest.go({exclude:"currently,hourly,daily,alerts,flags"});
		jsonpRequest.response(function(request,response) {
			response.minutely.data.forEach( function(minute) {
				minute.time = minute.time * 1000;
			});
			return response.minutely;
		});
		return jsonpRequest;
	},

	formatTime:function(date) {
		return date.toISOString().replace(/\.\d+/,'');
	}
});
