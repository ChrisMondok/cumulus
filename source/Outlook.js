enyo.kind({
	name:"Cumulus.Outlook",
	kind:"FittableRows",
	classes:"outlook",

	published:{
		api:undefined,
		daily:undefined,
		currently:undefined,
		advisories:undefined,
		place:undefined
	},

	events:{
		onDayPicked:"",
		onShowMap:"",
		onAdvisoryPicked:"",
		onReceivedAPIError:""
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
			{name:"advisoriesDrawer", kind:"Drawer", open:false, components:[
				{name:"advisoryRepeater", kind:"Repeater", onSetupItem:"renderAdvisory", components:[
					{name:"name", classes:"advisory title", ontap:"pickAdvisory"}
				]}
			]},
			{name:"advisoriesOpener", classes:"advisories-button", showing:false, ontap:"toggleAdvisoriesDrawer"},
			{name:"currentConditions", kind:"Cumulus.Forecast", classes:"primary dark", now:true, showHumidity:true, ontap:"showMap"},
			{name:"dayRepeater", kind:"Repeater", classes:"light", onSetupItem:"renderDay", components:[
				{name:"forecast", kind:"Cumulus.Forecast", ontap:"pickDay"}
			]},
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
		this.$.loadingPopup.show();
		var self = this;
		var api = this.getApi();
		api.getForecast(this.getPlace())
			.response(this, "gotForecast")
			.error(function(ajax,error) {
				self.doReceivedAPIError({request:ajax, error:error})
			});
		return;
	},

	gotForecast:function(ajax,response) {
		this.$.loadingPopup.hide();
		this.setCurrently(response.currently);
		this.setDaily(response.daily.data);
		this.setAdvisories(response.alerts || []);
	},

	currentlyChanged:function() {
		this.$.currentConditions.setData(this.getCurrently());
	},

	dailyChanged:function(oldValue, newValue) {
		this.$.dayRepeater.setCount(newValue.length);
	},

	renderDay:function(sender, event) {
		var item = event.item, period = this.getDaily()[event.index];
		item.$.forecast.setData(period);
	},

	advisoriesChanged:function(old,advisories) {
		if(advisories.length) {
			this.$.advisoriesOpener.setContent([advisories.length,$L("advisories")].join(" "));
			this.$.advisoriesOpener.show();
			this.$.advisoryRepeater.setCount(advisories.length);
		}
		else {
			this.$.advisoriesOpener.hide();
		}
	},

	toggleAdvisoriesDrawer:function() {
		this.$.advisoriesDrawer.setOpen(!this.$.advisoriesDrawer.getOpen());
	},

	renderAdvisory:function(sender, event) {
		var item = event.item, advisory = this.getAdvisories()[event.index];
		item.$.name.setContent(advisory.title);
	},

	pickDay:function(sender,event) {
		var message = {
			daily:this.getDaily()[event.index]
		};

		this.doDayPicked(message);
	},

	pickAdvisory:function(sender, event) {
		this.doAdvisoryPicked({advisory:this.getAdvisories()[event.index]});
	}
});
