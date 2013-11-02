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
		hourly:null
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},

	components:[
		{classes:"today", components:[
			{name:"dayCarousel", kind:"Panels", onTransitionFinish:"dayCarouselChanged", classes:"title-carousel", arrangerKind:"CarouselArranger"},
			{name:"summary", classes:"summary"}
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
					}
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

		var today = new Date();
		today.setHours(0,0,0,0);

		for(var i = 0; i < 7; i++) {
			var day = this.$.dayCarousel.createComponent({
				classes:"title",
				content:Cumulus.Main.formatDay(new Date(today.getTime() + 24*60*60*1000*i))
			});
			day.render();
		}
		this.$.dayCarousel.reflow();
	},

	getApiFromEvent:function(event) {
		this.setApi(event.api);
	},

	setupCarouselItem:function(repeater, event) {
		var today = new Date();
		event.item.$.day.setContent(
			Cumulus.Main.formatDay(new Date(today.getTime() + 24*60*60*1000*event.index))
		);

		return true;
	},
	dayCarouselChanged:function(carousel, event) {
		if(event.fromIndex == event.toIndex)
			return;

		var today = new Date();
		today.setHours(0,0,0,0);
		var newDay = today.getTime() + event.toIndex * 24*60*60*1000;
		this.setDay(new Date(newDay));
	},

	dayChanged:function(oldDay, day) {
		var api = this.getApi(),
			place = this.getPlace();

		if(day) {
			var today = new Date();
			today.setHours(0,0,0,0);

			var daysFromNow = (day.getTime() - today.getTime())/(24*60*60*1000);

			if(oldDay)
				this.$.dayCarousel.setIndex(daysFromNow);
			else
				this.$.dayCarousel.setIndexDirect(daysFromNow);

			if(api && place)
				this.startJob(this.id+'refresh','refresh',10);
		}
		else {
			this.setHourly();
			this.setDaily();
		}

		this.$.scroller.scrollToTop();
	},

	dailyChanged:function(old, daily) {
		this.$.summary.setContent(daily && daily.summary || "");
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
		var day = this.getDay(),
			place = this.getPlace();

		day.setHours(0,0,0,0);

		this.startJob('showLoadingPopup',enyo.bind(this.$.loadingPopup,"show"),100,1);

		this.getApi().getDailyForecast(place,day).response(this,"gotDaily");
		this.getApi().getHourlyForecast(place,day).response(this,"gotHourly");
	},

	gotDaily:function(ajax,daily) {
		this.setDaily(daily[0]);
	},

	gotHourly:function(ajax,hourly) {
		this.stopJob('showLoadingPopup');
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

		this.$.popDrawer.setOpen(maxPop > this.getPopThreshhold());
		this.$.popGraph.setData(data);
		this.$.tempGraph.setData(data);
		this.$.humidityGraph.setData(data);
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
