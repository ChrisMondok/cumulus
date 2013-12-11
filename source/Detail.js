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

		graphAnimator:null,
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},

	popDrawerFinished:function() {
		var data = this.getHourly();
		this.getGraphAnimator().play();
		this.$.popGraph.setData(data);
		this.$.tempGraph.setData(data);
		this.$.humidityGraph.setData(data);
	},

	components:[
		{classes:"today", components:[
			{name:"dayCarousel", kind:"Panels", onTransitionFinish:"dayCarouselChanged", classes:"title-carousel", arrangerKind:"CarouselArranger"},
			{name:"summary", classes:"summary"}
		]},
		{fit:true, style:"position:relative", components:[
			{name:"loadingPopup", kind:"Cumulus.LoadingPopup"},
			{name:"scroller", kind:"Scroller", thumb:false, horizontal:"hidden", classes:"scroller dark enyo-fit", components:[
				{name:"popDrawer", kind:"Drawer", onDrawerAnimationEnd:"popDrawerFinished", components:[
					{classes:"divider", content:"Chance of precipitation"},
					{
						name:"popGraph",
						kind:"Cumulus.Graph",
						classes:"group",
						key:"precipProbability",
						min:0, max:1,
						fillColor:"rgba(132,167,193,0.5)",
						strokeColor:"rgba(132,167,193,1)"
					}
				]},
				{classes:"divider", content:"Temperature"},
				{
					name:"tempGraph",
					classes:"group",
					kind:"Cumulus.TemperatureGraph",
					key:"temperature",
					fillColor:"rgba(255,0,0,0.25)",
					strokeColor:"rgba(255,0,0,1)"
				},
				{classes:"divider", content:"Humidity"},
				{
					name:"humidityGraph",
					classes:"group",
					kind:"Cumulus.Graph",
					key:"humidity",
					min:0, max:1,
					fillColor:"rgba(255,255,255,0.25)",
					strokeColor:"rgba(255,255,255,0.75)"
				},
				{classes:"divider", content:"Conditions"},
				{name:"conditionRepeater", classes:"group", kind:"Repeater", onSetupItem:"renderCondition", components:[
					{name:"row", classes:"row condition nice-padding", components:[
						{name:"icon", kind:"Cumulus.WeatherIcon"},
						{name:"timespan", classes:"title"},
						{name:"weather"}
					]}
				]},
				{name:"normals",  kind:"Cumulus.Normals"},
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

		this.setGraphAnimator(
			this.createComponent({name:"animator", kind:"Animator", onStep:"drawGraphs", duration:750})
		);
	},

	graphAnimatorChanged:function(oldAnimator, animator) {
		this.$.popGraph.setAnimator(animator);
		this.$.tempGraph.setAnimator(animator);
		this.$.humidityGraph.setAnimator(animator);
	},

	drawGraphs:function() {
		this.$.popGraph.drawGraph();
		this.$.tempGraph.drawGraph();
		this.$.humidityGraph.drawGraph();
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

		var conditions = data.reduce(function(output,value,index,periods) {

			maxPop = Math.max(maxPop, value.precipProbability);

			if(output.length) 
			{
				output[output.length-1].end = value.time;
			}

			if(output.length < 1 
				|| output[output.length-1].summary != value.summary
				|| output[output.length-1].icon != value.icon)
			{
				output.push({summary:value.summary, icon:value.icon, start: value.time, end:value.time + 1000*60*60});
			}
			return output;
			},
		[]);

		conditions[conditions.length - 1].end = data[data.length - 1].time + 1000*60*60;

		this.setConditions(conditions);

		var dsbo = maxPop > this.getPopThreshhold();
		if(this.$.popDrawer.getOpen() == dsbo || !data.length)
		{
			if(data.length)
				this.getGraphAnimator().play();
			this.$.popGraph.setData(data);
			this.$.tempGraph.setData(data);
			this.$.humidityGraph.setData(data);
		}
		else
			if(data.length)
				this.$.popDrawer.setOpen(dsbo);
		return;
	},

	conditionsChanged:function() {
		this.$.conditionRepeater.setCount((this.getConditions() || []).length);
		this.reflow();
	},

	renderCondition:function(sender,event) {
		var condition = this.getConditions()[event.index],
			item = event.item,
			now = new Date().getTime();

		item.$.weather.setContent(condition.summary);
		item.$.icon.setIcon(condition.icon);
		item.$.row.addRemoveClass("current", now >= condition.start && now < condition.end);
		if(this.getConditions().length == 1)
			item.$.timespan.setContent($L("All day"));
		else
			item.$.timespan.setContent(Cumulus.Main.formatTime(new Date(condition.start))+" - "+Cumulus.Main.formatTime(new Date(condition.end)));

		return true;
	}
});
