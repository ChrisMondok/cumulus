enyo.kind({
	name:"Cumulus.Outlook",
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
		{name:"scroller", kind:"Scroller", classes:"enyo-fit", thumb:false, horizontal:"hidden", components:[
			{name:"advisoriesDrawer", kind:"Drawer", open:false, components:[
				{name:"advisoryRepeater", kind:"Repeater", onSetupItem:"renderAdvisory", components:[
					{name:"name", classes:"advisory title", ontap:"pickAdvisory"}
				]}
			]},
			{name:"advisoriesOpener", classes:"advisories-button", showing:false, ontap:"toggleAdvisoriesDrawer"},
			{name:"currentConditions", kind:"Cumulus.Forecast", classes:"primary dark", now:true, showHumidity:true, ontap:"toggleMinutely"},
			{name:"minutelyForecastDrawer", kind:"Drawer", classes:"minutely-forecast-drawer", open:false, components:[
				{name:"minutelyForecast", kind:"Cumulus.MinutelyForecast"}
			]},
			{name:"dayRepeater", kind:"Repeater", classes:"light", onSetupItem:"renderDay", components:[
				{name:"forecast", kind:"Cumulus.Forecast", ontap:"pickDay"}
			]},
			{classes:"command-menu-placeholder"}
		]},
		{name:"loadingPopup", kind:"Cumulus.LoadingPopup"}
	],

	apiChanged:function() {
		if(this.getPlace())
			this.refresh();
	},

	placeChanged:function(oldPlace, newPlace) {
		if(this.getApi())
			this.refresh();
		this.$.minutelyForecast.setPlace(newPlace);
	},

	refresh:function() {
		this.$.loadingPopup.show();
		var place = this.getPlace(),
			api = this.getApi();

		api.getDailyForecast(this.getPlace())
			.response(this, "gotForecast")
			.error(function(ajax,error) {
				self.doReceivedAPIError({request:ajax, error:error})
			});
		api.getCurrent(this.getPlace())
			.response(this, function(async,currently) {
				this.setCurrently(currently);
			});
		api.getAlerts(this.getPlace())
			.response(this, function(async, advisories) {
				this.setAdvisories(advisories);
			});
		return;
	},

	toggleMinutely:function() {
		if(!this.$.minutelyForecastDrawer.getOpen())
			this.$.minutelyForecast.refresh();
		this.$.minutelyForecastDrawer.setOpen(!this.$.minutelyForecastDrawer.getOpen());
	},

	gotForecast:function(ajax,response) {
		this.$.loadingPopup.hide();
		this.setDaily(response);
	},

	currentlyChanged:function() {
		this.$.currentConditions.setData(this.getCurrently());
	},

	dailyChanged:function(oldValue, newValue) {
		this.$.dayRepeater.setCount(newValue.length);
	},

	renderDay:function(sender, event) {
		var item = event.item,
			data = this.getDaily()[event.index];
		item.$.forecast.setData(data);
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
			day:this.getDaily()[event.index].time
		};

		this.doDayPicked(message);
	},

	pickAdvisory:function(sender, event) {
		this.doAdvisoryPicked({advisory:this.getAdvisories()[event.index]});
	}
});
