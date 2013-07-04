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
			cachebust:false
		});

		ajax.go(
			enyo.mixin({
				client_id:this.getConsumerId(),
				client_secret:this.getConsumerSecret()
			}, query)
		);

		return ajax;
	},
	getObservations:function(loc) {
		if(typeof loc == "string")
			return this.makeRequest('observations/'+loc, this.getFilter);
		else
			return this.makeRequest('observations/closest',{p:loc.lat+","+loc.lon});
	},
	getForecast:function(loc) {
		if(typeof loc == "string")
			return this.makeRequest('forecasts/'+loc, this.getFilter);
		else
			return this.makeRequest('forecasts/closest',{p:loc.lat+","+loc.lon});
	},
	getHourlyForecast:function() {
		if(typeof loc == "string")
			return this.makeRequest('forecasts/'+loc, this.getFilter);
		else
			return this.makeRequest('forecasts/closest',{p:loc.lat+","+loc.lon,filter:"1hr"});
	},
});
