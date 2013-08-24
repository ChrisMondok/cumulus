enyo.kind({
	name:"Cumulus.Detail",
	kind:"FittableRows",

	classes:"detail",

	published:{
		api:null,
		sunMoon:null,
		place:null,
		periods:null,
		conditions:null,
		tides:null,
		data:null
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},
	
	components:[
		{name:"today", classes:"today", kind:"Cumulus.Forecast", showWeather:false, showRange:false, showPop:false, showHumidity:true},
		{fit:true, style:"position:relative", components:[
			{name:"loadingPopup", kind:"LoadingPopup"},
			{name:"scroller", kind:"Scroller", touch:true, thumb:false, horizontal:"hidden", classes:"scroller dark enyo-fit", components:[
				{kind:"Divider", content:"Temperature"},
				{
					name:"tempGraph",
					kind:"Cumulus.TemperatureGraph",
					key:"tempF",
					fillColor:"rgba(255,0,0,0.25)",
					strokeColor:"rgba(255,0,0,1)"
				},
				{kind:"Divider", content:"Chance of precipitation"},
				{
					name:"popGraph",
					kind:"Graph",
					key:"pop",
					fillColor:"rgba(132,167,193,0.5)",
					strokeColor:"rgba(132,167,193,1)"
				},
				{name:"normals", kind:"Cumulus.Normals"},
				{kind:"Divider", content:"Conditions"},
				{name:"conditionRepeater", kind:"Repeater", onSetupItem:"renderCondition", components:[
					{classes:"row condition nice-padding", components:[
						{name:"icon", kind:"Cumulus.WeatherIcon"},
						{name:"timespan", classes:"label"},
						{name:"weather"}
					]}
				]},
				{classes:"command-menu-placeholder"}
			]},
		]},
	],

	getApiFromEvent:function(event) {
		this.setApi(event.api);
	},

	dataChanged:function() {
		var data = this.getData();
		window.TOD = this.$.today;
		window.DAT = data;
		this.$.today.setData(data);
		this.$.normals.setData(data);
		if(data && this.getApi() && this.getPlace())
			enyo.job('refresh',enyo.bind(this,"refresh"),100);
		else
		{
			this.setTides(null);
			this.setPeriods([]);
		}

		this.$.scroller.scrollToTop();
	},

	apiChanged:function() {
		if(this.getData() && this.getPlace())
			enyo.job('refresh',enyo.bind(this,"refresh"),100);
	},

	placeChanged:function() {
		if(this.getApi() && this.getData())
			enyo.job('refresh',enyo.bind(this,"refresh"),100);
	},

	refresh:function() {
		this.$.loadingPopup.show();
		this.getApi().getAsync('hourlyForecast',this.getPlace(),new Date(this.getData().dateTimeISO))
			.response(enyo.bind(this,"gotHourlyForecast"));
		this.getApi().getAsync('tides',this.getPlace(), new Date(this.getData().dateTimeISO))
			.response(enyo.bind(this,"gotTides"));
	},

	gotHourlyForecast:function(ajax,response) {
		this.$.loadingPopup.hide();
		if(response.response instanceof Array)
			this.setPeriods(response.response[0].periods);
		else
			this.setPeriods(response.response.periods);
	},

	gotTides:function(ajax,response) {
		if(response.error)
			ajax.fail(response.error);
		else
		{
			if(response.response instanceof Array)
				this.setTides(response.response[0].periods);
			else
				this.setTides(response.response.periods);
		}
	},

	periodsChanged:function() {
		var periods = this.getPeriods();

		this.setConditions(periods.reduce(function(output,value,index,periods) {
				if(output.length < 1 || output[output.length-1].weather != value.weather)
					output.push({weather:value.weather, icon:value.icon, start: value.dateTimeISO, end:value.dateTimeISO});
				else
					output[output.length-1].end = value.dateTimeISO;
				return output;
			}, []));

		this.$.tempGraph.setData(periods);
		this.$.popGraph.setData(periods);
	},

	conditionsChanged:function() {
		this.$.conditionRepeater.setCount((this.getConditions() || []).length);
	},

	tidesChanged:function() {
		this.$.normals.setTides(this.getTides());
	},

	renderCondition:function(sender,event) {
		var condition = this.getConditions()[event.index],
			item = event.item;

		item.$.weather.setContent(condition.weather);
		item.$.icon.setIcon(condition.icon);
		item.$.timespan.setContent(Cumulus.Main.formatTime(new Date(condition.start))+ " - "+Cumulus.Main.formatTime(new Date(condition.end)));

		return true;
	},

	create:function() {
		this.inherited(arguments);
		window.graph = this.$.popGraph;
		window.detail = this;
	}
});
