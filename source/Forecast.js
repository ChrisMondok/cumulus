enyo.kind({
	name:"Weather.Forecast",
	kind:"FittableColumns",

	classes:"observations",

	published:{
		observations:{},

		imperial:true,
		metric:false,

		icon:"na.png",
		weather:"Loading",
		tempF:"",
		feelslikeF:"",
		tempC:"",
		feelslikeC:"",
		dateTimeISO:"",
		humidity:"",
		pop:"",
	},

	bindings:[
		{
			from:"icon",
			to:".$.icon.src",
			transform:function(value) {
				if(value) 
					return "assets/weathericons/"+value;
				return value;
			}
		},
		{from:"weather", to:".$.weather.content"},
		{from:"tempF", to:".$.tempF.content"},
		{from:"feelslikeF", to:".$.feelsLikeF.content"},
		{from:"tempC", to:".$.tempC.content"},
		{from:"feelslikeC", to:".$.feelsLikeC.content"},
		{from:"pop", to:".$.pop.content"},
		{from:"humidity", to:".$.humidity.content"},
		{
			from:"dateTimeISO",
			to:".$.day.content",
			transform:function(value) {
				if(value) {
					var date = new Date(value);
					date.setHours(0,0,0,0);

					var today = new Date();
					today.setHours(0,0,0,0);

					if(today - date == 0)
						return $L("today");
					else
						return $L(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()])
				}
				return value;
			}
		}
	],

	components:[
		{fit:true, kind:"FittableRows", components:[
			{name:"day", classes:"day"},
			{name:"weather"},
			{components:[
				{name:"fahrenheit", showing:false, components:[
					{name:"tempNowF", components:[
						{tag:"span", name:"tempF"},
						{tag:"span", classes:"label", content:"°F"},
						{tag:"span", classes:"label", content:" (feels like "},
						{tag:"span", name:"feelsLikeF"},
						{tag:"span", classes:"label", content:" °F)"},
					]},
					{name:"tempRangeF", showing:false, components:[
						{content:"TEMP RANGE F"}
					]}
				]},
				{name:"celcius", showing:false, components:[
					{name:"tempNowC", components:[
						{tag:"span", name:"tempC"},
						{tag:"span", classes:"label", content:"°C"},
						{tag:"span", classes:"label", content:" (Feels like "},
						{tag:"span", name:"feelsLikeC"},
						{tag:"span", classes:"label", content:" °C)"},
					]},
					{name:"tempRangeC", showing:false, components:[
						{content:"TEMP RANGE C"}
					]},
				]}
			]},
			{name:"popRow", showing:false, components:[
				{tag:"span", name:"pop"},
				{tag:"span", classes:"label", content:"% chance of precipitation"}
			]},
			{name:"humidityRow", showing:false, components:[
				{tag:"span", name:"humidity"},
				{tag:"span", classes:"label", content:"% humidity"}
			]},
		]},
		{classes:"icon-container nice-margin", components:[
			{name:"icon", kind:"Image"},
		]}
	],

	observationsChanged:function() {
		var observations = this.getObservations()

		for(var key in observations)
			if(this.published.hasOwnProperty(key))
				this.set(key,observations[key]);

		this.updateShowing();

		this.reflow();
	},

	updateShowing:function() {
		var observations = this.getObservations();

		this.$.fahrenheit.setShowing(this.getImperial() && (observations.hasOwnProperty('tempF')));
		this.$.celcius.setShowing(this.getMetric() && (observations.hasOwnProperty('tempC')));

		this.$.tempRangeF.setShowing(this.getImperial() && (observations.hasOwnProperty('maxTempF')));
		this.$.tempRangeC.setShowing(this.getMetric() && (observations.hasOwnProperty('maxTempC')));

		this.$.popRow.setShowing(observations.hasOwnProperty('pop'));

		this.$.humidityRow.setShowing(observations.hasOwnProperty('humidity'));
	},
	
	create:function() {
		this.inherited(arguments);
		window.obs = this;
	}
});
