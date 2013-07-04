enyo.kind({
	name:"Weather.API",
	published:{
		consumerSecret:"",
		consumerId:"",
		apiUrl:"http://api.aerisapi.com/",
		imperial:true,
		metric:false
	},
	create:function() {
		this.inherited(arguments);
		if(window.consumerId)
			this.setConsumerId(window.consumerId);
		if(window.consumerSecret)
			this.setConsumerSecret(window.consumerSecret);
	},
	makeRequest:function(endpoint,query) {
		var ajax = new enyo.Ajax({
			url:this.getApiUrl()+endpoint,
			cacheBust:false
		});

		ajax.go(
			enyo.mixin({
				client_id:this.getConsumerId(),
				client_secret:this.getConsumerSecret()
			}, query)
		);

		return ajax;
	},
	endpointAndLoc:function(endpoint, loc, query) {
		if(typeof loc == "object")
			rv = [endpoint,enyo.mixin({p:loc.lat+","+loc.lon},query)];
		else
			rv = [endpoint+loc, query];
		return rv;
	},
	getObservations:function(loc) {
		return this.makeRequest.apply(this,this.endpointAndLoc('observations',loc));
	},
	getForecast:function(loc) {
		return this.makeRequest.apply(this,this.endpointAndLoc('forecasts',loc));
	},
	getHourlyForecast:function(loc, day) {
		var limit = 24;

		var from = new Date(day), today = new Date();
		from.setHours(0,0,0,0);
		today.setHours(0,0,0,0);

		if(today == from)
			limit = 24 - new Date().getHours()

		return this.makeRequest.apply(this,this.endpointAndLoc('forecasts',loc,
			{
				filter:"1hr",
				from:Math.floor(from.getTime()/1000),
				limit:limit
			}
		));
	},
	getSunMoon:function(loc) {
		return this.makeRequest.apply(this,this.endpointAndLoc('sunmoon',loc));

	},
});
