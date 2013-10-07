enyo.kind({
	name:"Cumulus.Detail",
	kind:"FittableRows",

	classes:"detail",

	published:{
		popThreshhold: 0.1,

		day:null,
		daily:null,

		api:null,
		place:null,
		conditions:null,
		hourly:null,

	},

	handlers:{
		onApiCreated:"getApiFromEvent",
		onAnimationFinished:"graphAnimationFinished"
	},

	graphAnimationFinished:function(graph,event) {
		var hourly = this.getHourly();
		if(hourly && hourly.length) {
			switch (event.originator) {
				case this.$.popGraph:
					this.$.tempGraph.setData(hourly);
					break;
				case this.$.tempGraph:
					this.$.humidityGraph.setData(hourly);
					break;
			}
		}
	},
	
	components:[
		{classes:"today", components:[
			{kind:"Panels", onTransitionFinish:"dayCarouselChanged", classes:"title-carousel", arrangerKind:"CarouselArranger", controlClasses: "title", index:1, components:[
				{name:"previousDay"},
				{name:"day"},
				{name:"nextDay"}
			]},
			{name:"summary", classes:"summary"},
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

	dayCarouselChanged:function(carousel, event) {
		if(event.toIndex == 1)
			return;

		var delta = event.toIndex - 1;
		var newDay = this.getDay().getTime() + delta * 24*60*60*1000;
		this.setDay(new Date(newDay));
		carousel.setIndexDirect(1);
	},

	dayChanged:function(oldDay, day) {
		var api = this.getApi(),
			place = this.getPlace();

		if(day) {
			this.$.previousDay.setContent(Cumulus.Main.formatDay(new Date(day.getTime() - 24*60*60*1000)));
			this.$.day.setContent(Cumulus.Main.formatDay(new Date(day.getTime())));
			this.$.nextDay.setContent(Cumulus.Main.formatDay(new Date(day.getTime() + 24*60*60*1000)));
		}

		if(day && api && place) {
			this.startJob(this.id+'refresh','refresh',10);
		}
		else {
			this.setHourly();
			this.setDaily();
		}

		this.$.scroller.scrollToTop();
	},

	dailyChanged:function(old, daily) {
		if(daily) {
			this.$.summary.setContent(daily && daily.summary || "");
		}
		this.$.normals.setData(daily);
	},

	apiChanged:function() {
		if(this.getDay() && this.getPlace())
			this.startJob(this.id+'refresh','refresh',10);
	},

	placeChanged:function() {
		if(this.getApi() && this.getDay())
			this.startJob(this.id+'refresh','refresh',10);
	},

	refresh:function() {
		var day = this.getDay();
		day.setHours(0,0,0,0);
		this.$.loadingPopup.show();
		this.getApi().getDailyForecast(this.getPlace,day)
			.response(this,"gotDaily");
		this.getApi().getHourlyForecast(this.getPlace(),day)
			.response(this,"gotHourly");
	},

	gotDaily:function(ajax,daily) {
		this.setDaily(daily[0]);
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
			item.$.timespan.setContent(Cumulus.Main.formatTime(new Date(condition.start))+" - "+Cumulus.Main.formatTime(new Date(condition.end)));

		return true;
	}
});
