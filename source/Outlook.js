enyo.kind({
	name: "cumulus.Outlook",
	classes: "outlook",

	published: {
		api: undefined,
		place: undefined,
		forecast: undefined
	},

	events: {
		onDayPicked: "",
		onShowMap: "",
		onAdvisoryPicked: "",
		onReceivedAPIError: ""
	},

	handlers: {
		onApiCreated: "getApiFromEvent"
	},

	getApiFromEvent: function(sender,event){
		this.setApi(event.api);
	},

	create: function() {
		window.OUTLOOK = this;
		this.inherited(arguments);
	},

	bindings:[
		{from: '.forecast.daily', to: '.$.dayRepeater.collection'},
		{from: '.forecast.currently', to: '.$.currentConditions.model'},
		{from: '.api', to: '.$.minutelyForecast.api'},
		{from: '.store', to: '.$.minutelyForecast.store'},
		{from: '.forecast', to: '.$.minutelyForecast.forecast'}
	],

	components: [
		{name: "scroller", kind: "Scroller", classes: "enyo-fit", thumb: false, horizontal: "hidden", components: [
			{name: "advisoriesDrawer", kind: "Drawer", open: false, components: [
				{name: "advisoryRepeater", kind: "Repeater", onSetupItem: "renderAdvisory", components: [
					{name: "name", classes: "advisory title", ontap: "pickAdvisory"}
				]}
			]},
			{name: "advisoriesOpener", classes: "advisories-button", showing: false, ontap: "toggleAdvisoriesDrawer"},
			{name: "currentConditions", kind: "cumulus.Forecast", classes: "primary dark", now: true, showHumidity: true, ontap: "toggleMinutely"},
			{name: "minutelyForecastDrawer", kind: "Drawer", classes: "minutely-forecast-drawer", open: false, components: [
				{name: "minutelyForecast", kind: "cumulus.MinutelyForecast"}
			]},
			{name: "dayRepeater", kind: "DataRepeater", selection: false, classes: "light", onSetupItem: "renderDay", components: [
					{kind: "cumulus.Forecast", ontap: "pickDay"}
				], bindings: [
					{from: '.model', to: '.$.model'}
				]
			}
		]},
		{name: "loadingPopup", kind: "cumulus.LoadingPopup"}
	],

	toggleMinutely: function() {
//		if(!this.$.minutelyForecastDrawer.getOpen())
//			this.$.minutelyForecast.refresh();
		this.$.minutelyForecastDrawer.setOpen(!this.$.minutelyForecastDrawer.getOpen());
	},

	advisoriesChanged: function(old,advisories) {
	//	if(advisories.length) {
	//		this.$.advisoriesOpener.setContent([advisories.length,$L(advisories.length === 1 ? "advisory" : "advisories")].join(" "));
	//		this.$.advisoriesOpener.show();
	//		this.$.advisoryRepeater.setCount(advisories.length);
	//	}
	//	else {
	//		this.$.advisoriesOpener.hide();
	//	}
	},

	toggleAdvisoriesDrawer: function() {
		this.$.advisoriesDrawer.setOpen(!this.$.advisoriesDrawer.getOpen());
	},

	pickDay: function(sender,event) {
		var time = this.getForecast().get('daily').at(event.index).get('time');
		window.location.hash = 'detail/'+time;
	},

	pickAdvisory: function(sender, event) {
		this.doAdvisoryPicked({advisory: this.getAdvisories()[event.index]});
	},

	showingChanged: function() {
		this.inherited(arguments);
		if(this.showing)
			enyo.Signals.send('onTitleChanged', {title:"Weekly Forecast"});
	}
});
