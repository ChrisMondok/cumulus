var defaultLifetimes = {
	hourly:60*60*1000, // 1 hour
	daily:24*60*60*1000, //1 day
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

	events:{
		onReceivedAPIError:""
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
		this.purgeExpiredItems();
	},

	purgeExpiredItems:function() {
		var cache = this.getCache(),
			now = new Date(),
			lifetimes = this.getCacheLifetimes();

		for(var key in cache) {
			var expireTime = now.getTime() + lifetimes[key];
			cache[key] = cache[key].filter(function(cachedItem) {
				var expires = false;
				if(cachedItem.hasOwnProperty('expires')) //alerts, conveniently, have this property
					valid = cachedItem.expires < now;
				else
					valid = cachedItem._updateTime < expireTime;
				if(!valid)
					console.log("Expiring a thing!");
				return valid
			});
		}
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

		if(cachedValues.length && (!end || cachedValues[cachedValues.length - 1].time >= end)) {
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

	getDayThatContainsTime:function(time) {
		var day = new Date(time);
		day.setHours(0,0,0,0);
		var start = day.getTime();
		var end = start + 23*60*60*1000;
		return {start:start, end:end};
	},

	getCurrent:function(loc) {
		return this.getAsync(loc,'currently').response(function(async, currently){return currently[0];});
	},

	getAlerts:function(loc) {
		return this.getAsync(loc,'alerts');
	},

	getDailyForecast:function(loc,time) {
		var async;
		if(time) {
			var range = this.getDayThatContainsTime(time);
			async = this.getAsync(loc,'daily',range.start,range.start);
		} else
			async = this.getAsync(loc,'daily');

		async.response(function(async, dailyForecasts) {
			if(!dailyForecasts.length)
				async.fail({error:"Didn't get any daily forecasts"});
		});

		return async;
	},

	getHourlyForecast:function(loc,time) {
		var async,
			range = this.getDayThatContainsTime(time);

		async = this.getAsync(loc,'hourly',range.start,range.end);

		async.response(function(async, hourlyForecasts) {
			if(!hourlyForecasts.length)
				async.fail({error:"Didn't get any hourly forecasts"});
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

	update:function(loc,time) {
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

		ajax.response(this,"gotUpdates");
		ajax.error(this, function(req,error) {
			this.doReceivedAPIError({url:url,error:error});
		});

		return ajax;
	},

	gotUpdates:function(ajax,response) {
		var cache = this.getCache(),
			now = new Date().getTime();

		//jam it into an array so it'll play nicely with the cache.
		if(response.hasOwnProperty('alerts'))
			response.alerts = {data:response.alerts};
		if(response.hasOwnProperty('currently'))
			response.currently = {data:[response.currently]};

		for(var property in cache) {
			if(response.hasOwnProperty(property)) {
				response[property].data.forEach(
					function(dataItem){
						for(var key in dataItem) {
							if(key == 'time' || key == 'expires' || key.indexOf('Time') == key.length - 4) {
								dataItem[key] = dataItem[key] * 1000;
							}
						}
						dataItem._updateTime = now;
						return dataItem;
					});
				this.mergeCachedProperty(property,response[property].data);
			}
			else
				console.warn("Didn't get "+property);
		}

		this.sortCache();
	},

	sortCache:function() {
		var cache = this.getCache();
		for(var property in cache) {
			cache[property].sort(function(a,b) {
				return a.time - b.time;
			});
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
