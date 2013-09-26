var defaultLifetimes = {
	hourly:60*60*1000, // 1 hour
	daily:24*60*60*1000, //1 day
	minutely: 30*60*1000, // 30 minutes
	currently: 30*60*1000, // 30 minutes
	alerts: 6*60*60*1000 // 6 hours
};
enyo.kind({
	name:"Cumulus.API.ForecastIO",
	published:{
		url:"https://api.forecast.io",
		key:undefined,
		cache:undefined,
		cacheLifetimes:undefined
	},
	create:function() {
		this.inherited(arguments);
		if(window.forecastIOKey)
			this.setKey(window.forecastIOKey);
		this.initializeCache();
	},
	initializeCache:function() {
		var cl = this.getCacheLifetimes() || {},
			cache, key;

		for(key in defaultLifetimes)
			cl[key] = cl[key] || defaultLifetimes[key];

		if(!this.cacheLifetimes)
			this.setCacheLifetimes(cl);

		cache = JSON.parse(localStorage.getItem('forecastCache')) || {};
		for(key in cl)
			cache[key] = cache[key] || [];

		this.setCache(cache);
	},

	persistCache:function() {
		var cacheAsString = JSON.stringify(this.getCache());
		localStorage.setItem('forecastCache',cacheAsString);
	},

	getFromCache:function(property,start,end,allowStale) {
		var now = new Date().getTime();

		return this.filterStartEnd(this.getCache()[property],start,end);
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

	getAsync:function(loc,property,start,end) {
		var self = this,
			async = new enyo.Async(),
			needsUpdate = false;

		var cachedValues = this.getFromCache(property,start,end);

		if(cachedValues.length) {
			async.go(cachedValues);
		} else {
			var request = null;
			if(start) {
				var day = new Date(start);
				day.setHours(0,0,0,0);
				request = this.update(loc,day);
			} else
				request = this.update(loc);

			request.response(function(ajax,response) {
				var values = self.getFromCache(property,start,end);
				async.go(values);
			});
		}

		return async;
	},

	getDailyForecast:function(loc,time) {
		var async;
		if(time) {
			var day = new Date(time);
			day.setHours(0,0,0,0);
			var start = day.getTime();
			var end = start + 24*60*60*1000 - 1;

			async = this.getAsync(loc,'daily',start,end);
		}
		else
			async = this.getAsync(loc,'daily');
		async.response(function(async, dailyForecasts) {
			if(!dailyForecasts.length)
				async.fail({error:"Didn't get any daily forecasts"});
		});

		return async;
	},

	update:function(loc,time) {
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

		ajax.go(); 

		ajax.response(this,"gotUpdates");

		return ajax;
	},

	gotUpdates:function(ajax,response) {
		var cache = this.getCache(),
			now = new Date().getTime(),
			cacheLifetimes = this.getCacheLifetimes();

		//jam it into an array so it'll play nicely with the cache.
		if(response.hasOwnProperty('currently'))
			response.currently = {data:[response.currently]};

		for(var key in cache) {
			if(response.hasOwnProperty(key)) {
				response[key].data.forEach(
					function(value){
						value._cacheExpireTime = now + cacheLifetimes[key];
						value.time = value.time * 1000;
						return value;
					});
				this.mergeCachedProperty(key,response[key].data);
			}
			else
				console.warn("Didn't get "+key);
		}
	},

	mergeCachedProperty:function(propertyName,values) {
		var cached = this.getCache()[propertyName],
			times = cached.map(function(value){return value.time;});

		console.groupCollapsed("Update cached property "+propertyName);

		for(var i = 0; i < values.length; i++) {
			var oldIndex = times.indexOf(values[i].time);
			if(oldIndex == -1) {
				console.log("Got new time "+values[i].time);
				cached.push(values[i]);
			}
			else {
				console.log("Updated time "+values[i].time);
				cached[oldIndex] = values[i];
			}
		}

		console.groupEnd();

		this.startJob('persistCache','persistCache',1000);

	},

	formatTime:function(date) {
		return date.toISOString().replace(/\.\d+/,'');
	}
});
