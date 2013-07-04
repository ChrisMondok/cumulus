enyo.kind({
	name:"Weather.Outlook",
	kind:"FittableRows",
	classes:"outlook",

	published:{
		api:undefined,
		observations:undefined,
		periods:undefined,
		place:undefined
	},

	events:{
		onDayPicked:""
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},

	getApiFromEvent:function(sender,event){
		this.setApi(event.api);
	},

	create:function() {
		this.inherited(arguments);
		if(this.getApi())
			this.refresh();
	},

	components:[
		{name:"scroller", kind:"Scroller", touch:true, fit:true, components:[
			{name:"observations", classes:"primary", now:true, ontap:"pickToday", kind:"Weather.Forecast"},
			{name:"periodRepeater", kind:"Repeater", onSetupItem:"renderPeriod", components:[
				{name:"period", kind:"Weather.Forecast", ontap:"pickPeriod"}
			]},
		]},
	],

	apiChanged:function() {
		this.refresh();
	},

	refresh:function() {
		var api = this.getApi();
		api.getObservations(this.getPlace())
			.response(enyo.bind(this,"gotObservations"))
			.error(function(ajax,error) {
				alert(JSON.stringify(error));
			});
		api.getForecast(this.getPlace())
			.response(enyo.bind(this,"gotForecast"))
			.error(function(ajax,error) {
				alert(JSON.stringify(error));
			});
	},

	gotObservations:function(ajax,response) {
		if(!response.error) {
			if(response.response instanceof Array)
				this.setObservations(response.response[0].ob);
			else
				this.setObservations(response.response.ob);
		}
		else
			ajax.fail(response.error);
	},

	observationsChanged:function() {
		this.$.observations.setData(this.getObservations());
	},

	gotForecast:function(ajax,response) {
		if(!response.error)
			this.setPeriods(response.response[0].periods)
		else
			ajax.fail(response.error);
	},

	periodsChanged:function() {
		this.$.periodRepeater.setCount(this.getPeriods().length);
	},

	renderPeriod:function(sender,event) {
		var item = event.item, period = this.getPeriods()[event.index];
		item.$.period.setData(period)
	},

	pickToday:function(sender,event) {
		this.doDayPicked({data:this.getObservations()});
	},

	pickPeriod:function(sender,event) {
		var top = this.$.periodRepeater.getControls()[event.index].getControls()[0].getBounds().top // get the item from the Owner Proxy 

		top -= this.$.scroller.getScrollTop();
		var message = {
			data:this.getPeriods()[event.index],
			top:top
		};

		this.doDayPicked(message);
	},
});
