enyo.kind({
	name:"Cumulus.Detail",
	kind:"FittableRows",

	classes:"detail",

	published:{
		api:null,

		place:null,
		conditions:null,
		daily:null,
		hourly:null,

		popThreshhold: 0.1
	},

	handlers:{
		onApiCreated:"getApiFromEvent",
		onAnimationFinished:"graphAnimationFinished"
	},

	graphAnimationFinished:function(graph,event) {
		var hourly = this.getHourly();
		if(hourly && hourly.data) {
			switch (event.originator) {
				case this.$.popGraph:
					this.$.tempGraph.setData(hourly.data);
					console.log("update temp graph");
					break;
				case this.$.tempGraph:
					console.log("update humidity graph");
					this.$.humidityGraph.setData(hourly.data);
					break;
			}
		}
	},
	
	components:[
		{classes:"today nice-padding", components:[
			{name:"day", classes:"title"},
			{name:"summary"},
		]},
		{fit:true, style:"position:relative", components:[
			{name:"loadingPopup", kind:"LoadingPopup"},
			{name:"scroller", kind:"Scroller", touch:true, thumb:false, horizontal:"hidden", classes:"scroller dark enyo-fit", components:[
				{name:"popDrawer", kind:"Drawer", components:[
					{kind:"Divider", content:"Chance of precipitation"},
					{
						name:"popGraph",
						kind:"Graph",
						key:"precipProbability",
						min:0, max:1,
						fillColor:"rgba(132,167,193,0.5)",
						strokeColor:"rgba(132,167,193,1)"
					},
				]},
				{kind:"Divider", content:"Temperature"},
				{
					name:"tempGraph",
					kind:"Cumulus.TemperatureGraph",
					key:"temperature",
					fillColor:"rgba(255,0,0,0.25)",
					strokeColor:"rgba(255,0,0,1)"
				},
				{kind:"Divider", content:"Humidity"},
				{
					name:"humidityGraph",
					kind:"Graph",
					key:"humidity",
					min:0, max:1,
					fillColor:"rgba(255,255,255,0.25)",
					strokeColor:"rgba(255,255,255,0.75)"
				},
				{kind:"Divider", content:"Conditions"},
				{name:"conditionRepeater", kind:"Repeater", onSetupItem:"renderCondition", components:[
					{classes:"row condition nice-padding", components:[
						{name:"icon", kind:"Cumulus.WeatherIcon"},
						{name:"timespan", classes:"title"},
						{name:"weather"}
					]}
				]},
				{name:"normals", kind:"Cumulus.Normals"},
				{classes:"command-menu-placeholder"}
			]}
		]}
	],

	create:function() {
		this.inherited(arguments);
		window.graph = this.$.popGraph;
		window.detail = this;
	},

	getApiFromEvent:function(event) {
		this.setApi(event.api);
	},

	dailyChanged:function() {
		var daily = this.getDaily();
		this.$.normals.setData(daily);

		if(daily) {
			this.$.day.setContent(Cumulus.Main.formatDay(new Date(daily.time * 1000)));
			this.$.summary.setContent(daily.summary);
		}

		if(daily && this.getApi() && this.getPlace()) {
			this.startJob(this.id+'refresh','refresh',10);
			this.$.scroller.scrollToTop();
		}
		else
			this.setHourly();

	},

	apiChanged:function() {
		if(this.getDaily() && this.getPlace())
			this.startJob(this.id+'refresh','refresh',10);
	},

	placeChanged:function() {
		if(this.getApi() && this.getDaily())
			this.startJob(this.id+'refresh','refresh',10);
	},

	refresh:function() {
		this.$.loadingPopup.show();
		var day = new Date(this.getDaily().time);
		day.setHours(0,0,0,0);
		this.getApi().getHourlyForecast(this.getPlace(),day)
			.response(this,"gotHourly");
	},

	gotHourly:function(ajax,hourly) {
		this.$.loadingPopup.hide();
		this.setHourly(hourly);
	},

	hourlyChanged:function(oldValue, hourly) {
		var data = hourly || [];

		var maxPop = 0;

		this.setConditions(data.reduce(function(output,value,index,periods) {

			maxPop = Math.max(maxPop, value.precipProbability);

			if(output.length) 
				output[output.length-1].end = value.time;

			if(output.length < 1 
				|| output[output.length-1].summary != value.summary
				|| output[output.length-1].icon != value.icon)
				output.push({summary:value.summary, icon:value.icon, start: value.time, end:value.time});
			return output;
			}, [])
		);

		if(data.length) {
			this.$.popDrawer.setOpen(maxPop > this.getPopThreshhold());
			if(this.$.popDrawer.getOpen())
				this.$.popGraph.setData(data);
			else
				this.$.tempGraph.setData(data);
		}
		else {
			this.$.popGraph.setData([]);
			this.$.tempGraph.setData([]);
			this.$.humidityGraph.setData([]);
		}
		return;
	},

	conditionsChanged:function() {
		this.$.conditionRepeater.setCount((this.getConditions() || []).length);
		this.reflow();
	},

	renderCondition:function(sender,event) {
		var condition = this.getConditions()[event.index],
			item = event.item;

		item.$.weather.setContent(condition.summary);
		item.$.icon.setIcon(condition.icon);
		if(this.getConditions().length == 1)
			item.$.timespan.setContent($L("All day"));
		else
			item.$.timespan.setContent(Cumulus.Main.formatTime(new Date(condition.start * 1000))+" - "+Cumulus.Main.formatTime(new Date(condition.end * 1000)));

		return true;
	}
});
