enyo.kind({
	name:"Weather.Detail",
	kind:"FittableRows",

	classes:"detail",

	published:{
		api:null,
		sunMoon:null,
		place:null,
		periods:null,
		data:null
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},
	
	components:[
		{name:"today", classes:"today", kind:"Weather.Forecast"},
		{kind:"Scroller", classes:"scroller", fit:true, components:[
			{kind:"Weather.Normals"},
			{name:"periodRepeater", kind:"Repeater", onSetupItem:"rp", components:[
				{name:"forecast", kind:"Weather.Forecast", classes:"hourly", hourly:true}
			]}
		]},
	],

	getApiFromEvent:function(event) {
		this.setApi(event.api);
	},

	dataChanged:function() {
		var data = this.getData();
		this.$.today.setData(data);
		this.$.normals.setData(data);
		this.refresh();
	},

	refresh:function() {
		this.getApi().getHourlyForecast(this.getPlace(),new Date(this.getData().dateTimeISO))
			.response(enyo.bind(this,"gotHourlyForecast"));
	},

	gotHourlyForecast:function(ajax,response) {
		if(response.response instanceof Array)
			this.setPeriods(response.response[0].periods);
		else
			this.setPeriods(response.response.periods);
	},

	periodsChanged:function() {
		var periods = this.getPeriods();
		this.$.periodRepeater.setCount(this.getPeriods().length);
		console.log("got "+periods.length+" periods");
	},

	rp:function(sender,event) {
		var item = event.item || this, period = this.getPeriods()[event.index];
		item.$.forecast.setData(period);
		console.log("render item "+event.index);

		return true;
	},

	create:function() {
		this.inherited(arguments);
		window.fc = this.$.today;
	}
});
