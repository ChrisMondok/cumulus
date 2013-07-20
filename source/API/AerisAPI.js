enyo.kind({
	name:"Cumulus.AerisAPI",
	published:{
		consumerSecret:"",
		consumerId:"",
		apiUrl:"http://api.aerisapi.com/"
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
			rv = [endpoint,enyo.mixin({p:loc.latitude+","+loc.longitude},query)];
		else
			rv = [endpoint+'/'+loc, query];
		return rv;
	},
	filterForDay:function(day) {
		var filter = {};

		var from = new Date(day);
		from.setHours(0,0,0,0);
		var to = new Date(from.getTime() + 1000*60*60*24 - 1);

		return {
			from:Math.floor(from.getTime() / 1000),
			to:Math.floor(to.getTime() / 1000)
		};
	},
	getObservations:function(loc) {
		return this.makeRequest.apply(this,this.endpointAndLoc('observations',loc));
	},
	getForecast:function(loc) {
		return this.makeRequest.apply(this,this.endpointAndLoc('forecasts',loc));
	},
	getHourlyForecast:function(loc, day) {

		return this.makeRequest.apply(this,this.endpointAndLoc(
			'forecasts',
			loc,
			enyo.mixin({filter:"1hr"},this.filterForDay(day))
		));
	},
	getSunMoon:function(loc) {
		return this.makeRequest.apply(this,this.endpointAndLoc('sunmoon',loc));

	},
	getTides:function(loc, day) {
		return this.makeRequest.apply(this,this.endpointAndLoc('tides/closest',loc,this.filterForDay(day)));
	}
});
