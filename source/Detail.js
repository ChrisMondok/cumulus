enyo.kind({
	name:"cumulus.Detail",
	kind:"FittableRows",

	classes:"detail",

	published:{
		forecast: null,

		model: null,

		conditions:null,
		hourly:null,

		store: null
	},

	bindings:[
		{from: '.forecast.daily', to: '.$.dayCarousel.collection'},
		{from: '.model', to: '.$.dayCarousel.model', oneWay: false},

		{from: '.model.hourly', to: '.$.popGraph.collection'},
		{from: '.model.hourly', to: '.$.tempGraph.collection'},

		{from: '.model.sunriseTime', to: '.$.popGraph.sunriseTime'},
		{from: '.model.sunsetTime', to: '.$.popGraph.sunsetTime'},
		{from: '.model.sunriseTime', to: '.$.tempGraph.sunriseTime'},
		{from: '.model.sunsetTime', to: '.$.tempGraph.sunsetTime'},

		{from: '.model.precipProbability', to: '.$.popDrawer.open', transform: function(p){return p > 0.1;}},
		{from: '.model', to: '.$.normals.model'},
		{from: '.conditions', to: '.$.conditionRepeater.collection'}
	],

	components:[
		{kind: 'enyo.Router', routes:[
			{path:'detail/:time', handler: 'routeHandler', context: 'owner'}
		]},
		{classes: 'today', components:[
			{name: 'dayCarousel', classes:'day-carousel', kind: 'cumulus.widgets.DataCarousel', style:"height: 80px", components:[
				{classes: 'enyo-fit', components:[
					{name: 'day', classes:'title'},
					{kind: 'cumulus.widgets.Marquee', classes: 'summary', components:[
						{name: 'summary'}
					]}
				], bindings:[
					{from: '.model.timeString', to: '.$.day.content'},
					{from: '.owner.showing', to: '.$.marquee.active'},
					{from: '.model.summary', to: '.$.summary.content'}
				]}
			]}
		]},
		{fit:true, style:"position:relative", components:[
			{name:"loadingPopup", kind:"cumulus.LoadingPopup"},
			{name:"scroller", kind:"Scroller", thumb:false, horizontal:"hidden", classes:"scroller dark enyo-fit", components:[
				{classes:"divider", content:"Temperature"},
				{
					name:"tempGraph",
					classes:"group",
					kind:"cumulus.TemperatureGraph",
					keys:["temperature","apparentTemperature"],
					fillColors:["rgba(255,0,0,0.25)", null],
					strokeColors:["rgba(255,0,0,1)","rgba(255,128,128,1)"]
				},
				{name:"popDrawer", animated: false, kind:"Drawer", components:[
					{classes:"divider", content:"Chance of precipitation"},
					{
						name:"popGraph",
						kind:"cumulus.Graph",
						classes:"group",
						keys:["precipProbability"],
						min:0, max:1,
						fillColors:["rgba(132,167,193,0.5)"],
						strokeColors:["rgba(132,167,193,1)"]
					}
				]},
				{classes:"divider", content:"Conditions"},
				{name: "conditionRepeater", kind: "DataRepeater", selection: false, classes: "group", components: [
					{classes:'row condition nice-padding', components:[
						{name:"icon", kind:"cumulus.WeatherIcon"},
						{name:"timespan", classes:"title"},
						{name:"summary", content: 'summary'}
					], bindings:[
						{from: '.model.summary', to: '.$.summary.content'},
						{from: '.model.icon', to: '.$.icon.icon'},
						{from: '.model.timespan', to: '.$.timespan.content'}
					]}
				]},
				{name:"normals",  kind:"cumulus.Normals"},

				{name:"animator", kind:"Animator", onStep:"drawGraphs", easingFunction: enyo.easing.quadInOut, duration:750}
			]}
		]}
	],

	observers:{
		updateTitle: ['showing', 'model']
	},

	updateTitle: function() {
		if(this.showing && this.model instanceof cumulus.models.Base) {
			var dayName = this.model.get('timeString');
			var title = dayName[0].toUpperCase() + dayName.slice(1)+"'s Forecast";
			enyo.Signals.send('onTitleChanged', {title:title});
		}
	},

	routeHandler: function(time) {
		this.setModel(this.store.findLocal(cumulus.models.Daily, {time: time}));
	},

	create:function() {
		this.inherited(arguments);

		window.DETAIL = this;

		var animator = this.$.animator;
		this.$.popGraph.setAnimator(animator);
		this.$.tempGraph.setAnimator(animator);
	},

	drawGraphs:function() {
		this.$.popGraph.drawGraph();
		this.$.tempGraph.drawGraph();
	},

	modelChanged: function(old, model) {
		this.$.animator.play();
		window.M = model;
		if(model instanceof cumulus.models.Base)
			this.set('conditions', this.calculateConditions());
	},

	calculateConditions:function() {
		var conditions = [];

		var hourly = this.getModel().get('hourly');

		for(var i = 0; i < hourly.length; i++) {
			var hour = hourly.at(i),
				summary = hour.get('summary'),
				time = hour.get('time'),
				icon = hour.get('icon');

			var lastCondition = conditions[conditions.length - 1];

			if(lastCondition)
				lastCondition.end = hour.get('time');
			if(!lastCondition || lastCondition.summary != summary || lastCondition.icon != icon)
				conditions.push({ summary: summary, icon: icon, start: time, end: time + 1000*60*60 });
		}

		return this.get('store').createCollection(cumulus.collections.Conditions, conditions);
	}
});
