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
		onDayPicked:"",
		onShowMap:""
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
		{name:"scroller", kind:"Scroller", thumb:false, touch:true, horizontal:"hidden", fit:true, components:[
			{name:"observations", kind:"Cumulus.Forecast", classes:"primary dark", now:true, showHumidity:true, ontap:"showMap"},
			{name:"periodRepeater", kind:"Repeater", classes:"light", onSetupItem:"renderPeriod", components:[
				{name:"period", kind:"Cumulus.Forecast", ontap:"pickPeriod"}
			]},
			{classes:"command-menu-placeholder"}
		]},
		{name:"loadingPopup", kind:"LoadingPopup"}
	],

	apiChanged:function() {
		if(this.getPlace())
			this.startJob(this.id+'refresh','refresh',250);
	},

	placeChanged:function() {
		if(this.getApi())
			this.startJob(this.id+'refresh','refresh',250);
	},

	refresh:function() {
		this.$.loadingPopup.show();
		var api = this.getApi();
		api.getAsync('observations',this.getPlace())
			.response(this,"gotObservations")
			.error(function(ajax,error) {
				alert(JSON.stringify(error));
			});
		api.getAsync('forecast',this.getPlace())
			.response(this,"gotForecast")
			.error(function(ajax,error) {
				alert(JSON.stringify(error));
			});
	},

	gotObservations:function(ajax,response) {
		var actualResponse;
		if(!response.error) {
			if(response.response instanceof Array)
				actualResponse = response.response[0];
			else
				actualResponse = response.response;

			this.setObservations(actualResponse.ob);
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
			this.setPeriods(response.response[0].periods);
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

	showMap:function(sender,event) {
		this.doShowMap();
		//this.doDayPicked({data:this.getObservations()});
	},

	pickPeriod:function(sender,event) {
		var top = this.$.periodRepeater.getControls()[event.index].getControls()[0].getBounds().top; // get the item from the Owner Proxy 

		top -= this.$.scroller.getScrollTop();
		var message = {
			data:this.getPeriods()[event.index],
			top:top
		};

		this.doDayPicked(message);
	}
});
