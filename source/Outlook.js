enyo.kind({
	name:"Cumulus.Outlook",
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
		{name:"scroller", kind:"Scroller", touch:true, horizontal:"hidden", fit:true, components:[
			{name:"observations", kind:"Cumulus.Forecast", classes:"primary dark", now:true, showHumidity:true, ontap:"pickToday"},
			{name:"periodRepeater", kind:"Repeater", classes:"light", onSetupItem:"renderPeriod", components:[
				{name:"period", kind:"Cumulus.Forecast", ontap:"pickPeriod"}
			]},
			{name:"placeName", classes:"label dark", style:"text-align:center"},
			{classes:"command-menu-placeholder"}
		]},
		{name:"loadingPopup", kind:"LoadingPopup"}
	],

	apiChanged:function() {
		if(this.getPlace())
			this.refresh();
	},

	placeChanged:function() {
		if(this.getApi())
			this.refresh();
	},

	refresh:function() {
		enyo.job('refresh', enyo.bind(this,function() {
			this.$.loadingPopup.show();
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
		}),250);
	},

	gotObservations:function(ajax,response) {
		var actualResponse;
		if(!response.error) {
			if(response.response instanceof Array)
				actualResponse = response.response[0];
			else
				actualResponse = response.response;

			this.setObservations(actualResponse.ob);
			this.$.placeName.setContent(actualResponse.place.name);
		}
		else
			ajax.fail(response.error);
	},

	observationsChanged:function() {
		var observations = this.getObservations();
		this.$.observations.setData(observations);
	},

	gotForecast:function(ajax,response) {
		this.$.loadingPopup.hide();
		if(!response.error)
			this.setPeriods(response.response[0].periods)
		else
			ajax.fail(response.error);
	},

	periodsChanged:function() {
		var periods = this.getPeriods();
		this.$.periodRepeater.setCount(periods.length);
	},

	renderPeriod:function(sender,event) {
		var item = event.item, period = this.getPeriods()[event.index];
		item.$.period.setData(period);
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
