enyo.kind({
	name:"Cumulus.Forecast",

	classes:"forecast nice-padding",

	published:{
		data:{},

		now:false,
		hourly:false,

		imperial:true,
		metric:false,
		showDay:true,
		showHumidity:false,
		showRange:true,
		showWeather:true,
		showPop:true,

		icon:"na.png",
		weather:"Loading",

		tempF:"",
		minTempF:"",
		avgTempF:"",
		maxTempF:"",
		feelslikeF:"",

		tempC:"",
		minTempC:"",
		avgTempC:"",
		maxTempC:"",
		feelslikeC:"",

		dateTimeISO:"",
		humidity:"",
		pop:"",
	},

	bindings:[
		{from:"icon", to:".$.iconL.src", transform:"transformIcon"},
		{from:"icon", to:".$.iconR.src", transform:"transformIcon"},
		{from:"weather", to:".$.weather.content"},

		{from:"hourly", to:".$.iconContainerR.showing", transform:function(v){return !v}},
		{from:"hourly", to:".$.iconContainerL.showing"},

		{from:"tempF", to:".$.tempF.content"},
		{from:"minTempF", to:".$.minTempF.content"},
		{from:"avgTempF", to:".$.avgTempF.content"},
		{from:"maxTempF", to:".$.maxTempF.content"},
		{from:"feelslikeF", to:".$.feelsLikeF.content"},

		{from:"tempC", to:".$.tempC.content"},
		{from:"minTempC", to:".$.minTempC.content"},
		{from:"avgTempC", to:".$.avgTempC.content"},
		{from:"maxTempC", to:".$.maxTempC.content"},
		{from:"feelslikeC", to:".$.feelsLikeC.content"},

		{from:"pop", to:".$.pop.content"},
		{from:"humidity", to:".$.humidity.content"},
		{from:"dateTimeISO", to:".$.day.content", transform:"transformDate"}
	],

	components:[
		{kind:"FittableColumns", components:[
			{name:"iconContainerL", classes:"icon-container", components:[
				{name:"iconL", kind:"Image"},
			]},
			{fit:true, kind:"FittableRows", classes:"body", components:[
				{name:"day", classes:"day"},
				{name:"weather"},
				{components:[
					{name:"fahrenheit", showing:false, components:[
						{name:"tempNowF", components:[
							{tag:"span", name:"tempF"},
							{tag:"span", name:"avgTempF"},
							{tag:"span", classes:"label", content:"°F"},
							{tag:"span", classes:"label", content:" (feels like "},
							{tag:"span", name:"feelsLikeF"},
							{tag:"span", classes:"label", content:" °F)"},
						]},
						{name:"tempRangeF", classes:"temp-range", showing:false, components:[
							{kind:"Image", src:"assets/icons/temp-max.png"},
							{tag:"span", name:"maxTempF"},
							{tag:"br"},
							{kind:"Image", src:"assets/icons/temp-min.png"},
							{tag:"span", name:"minTempF"},
						]}
					]},
					{name:"celcius", showing:false, components:[
						{name:"tempNowC", classes:"temp-range", components:[
							{tag:"span", name:"tempC"},
							{tag:"span", name:"avgTempC"},
							{tag:"span", classes:"label", content:"°C"},
							{tag:"span", classes:"label", content:" (Feels like "},
							{tag:"span", name:"feelsLikeC"},
							{tag:"span", classes:"label", content:" °C)"},
						]},
						{name:"tempRangeC", showing:false, components:[
							{kind:"Image", src:"assets/icons/temp-max.png"},
							{tag:"span", name:"maxTempC"},
							{tag:"br"},
							{kind:"Image", src:"assets/icons/temp-min.png"},
							{tag:"span", name:"minTempC"},
						]}
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
			{name:"iconContainerR", classes:"icon-container", components:[
				{name:"iconR", kind:"Image"},
			]}
		]}
	],

	dataChanged:function() {
		var data = this.getData()

		for(var key in data)
			if(this.published.hasOwnProperty(key))
				this.set(key,data[key]);

		if(!(data && data.icon))
			this.setIcon("na.png");

		this.updateShowing();

		this.reflow();
	},

	updateShowing:function() {
		var data = this.getData();

		this.$.day.setShowing(data && this.getShowDay() && data.hasOwnProperty('dateTimeISO'));
		this.$.weather.setShowing(data && this.getShowWeather() && data.hasOwnProperty('weather'));

		this.$.fahrenheit.setShowing(data && this.getImperial() && (data.hasOwnProperty('tempF')));
		this.$.celcius.setShowing(data && this.getMetric() && (data.hasOwnProperty('tempC')));

		this.$.tempRangeF.setShowing(data && this.getShowRange() && this.getImperial() && (data.hasOwnProperty('maxTempF')));
		this.$.tempRangeC.setShowing(data && this.getShowRange() && this.getMetric() && (data.hasOwnProperty('maxTempC')));

		this.$.avgTempF.setShowing(data && !(data.hasOwnProperty('tempF') && data.tempF !== null));
		this.$.avgTempC.setShowing(data && !(data.hasOwnProperty('tempC') && data.tempC !== null));

		this.$.popRow.setShowing(data && this.getShowPop() && data.hasOwnProperty('pop'));

		this.$.humidityRow.setShowing(data && this.getShowHumidity() && data.hasOwnProperty('humidity'));
	},

	transformIcon:function(value) {
		if(value) 
			return "assets/weathericons/"+value;
		return value;
	},

	transformDate:function(value) {
		if(this.getNow())
			return $L('now');
		if(value) {
			var date = new Date(value);

			if(this.getHourly()) {
				date.setMinutes(0);
				date.setSeconds(0);
				date.setMilliseconds(0);
				return Cumulus.Main.formatTime(date);
			}
			else {
				date.setHours(0,0,0,0);

				var today = new Date();
				today.setHours(0,0,0,0);

				if(today - date == 0)
					return $L("today");
				else
					return $L(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()])
			}
		}
		return value;
	}
});
