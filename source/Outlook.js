enyo.kind({
	name:"Weather.Outlook",
	kind:"FittableRows",
	classes:"forecast",

	published:{
		api:undefined,
		observations:undefined,
		periods:undefined,
		place:undefined
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
		{kind:"Scroller", touch:true, fit:true, components:[
			{name:"observations", classes:"primary", kind:"Weather.Forecast"},
			{name:"periodRepeater", kind:"Repeater", onSetupItem:"renderPeriod", components:[
				{tag:"hr", classes:"divider"},
				{name:"period", kind:"Weather.Forecast"}
			]},
		]},
	],

	apiChanged:function() {
		window.FC = this;
		this.refresh();
	},

	refresh:function() {
		console.log("Refreshing");
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
		window.RESPONSE = response;
		if(!response.error)
			this.setObservations(response.response[0].ob);
		else
			ajax.fail(response.error);
	},

	observationsChanged:function() {
		this.$.observations.setObservations(this.getObservations());
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
		item.$.period.setObservations(period)
	}
});
