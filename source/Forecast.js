enyo.kind({
	name:"Cumulus.Forecast",

	classes:"row forecast nice-padding",

	published:{
		data:{},

		now:false,
		hourly:false,

		showDay:true,
		showHumidity:false,
		showTemp:true,
		showRange:true,
		showWeather:true,
		showPop:true
	},

	components:[
		{name:"icon", kind:"Cumulus.WeatherIcon"},
		{name:"day", classes:"day title", content:$L("Loading")},
		{name:"weather"},
		{name:"tempNow", showing:false, components:[
			{tag:"span", name:"temp"},
			{tag:"span", classes:"label", content:" (feels like "},
			{tag:"span", name:"feelsLike"},
			{tag:"span", classes:"label", content:" °F)"}
		]},
		{name:"tempRange", showing:false, classes:"temp-range", components:[
			{kind:"Image", src:"assets/icons/temp-min.png"},
			{tag:"span", name:"minTemp"},
			{tag:"span", content:" - "},
			{kind:"Image", src:"assets/icons/temp-max.png"},
			{tag:"span", name:"maxTemp"}
		]},
		{name:"popRow", showing:false, components:[
			{tag:"span", name:"pop"},
			{tag:"span", classes:"label", content:"% chance of precipitation"}
		]},
		{name:"humidityRow", showing:false, components:[
			{tag:"span", name:"humidity"},
			{tag:"span", classes:"label", content:"% humidity"}
		]}
	],

	dataChanged:function() {
		var data = this.getData();
		if(data) {
			this.$.day.setContent(this.transformDate(data.time));
			this.$.icon.setIcon(data.icon);

			this.$.weather.setContent(data.summary);
			
			this.$.temp.setContent(data.temperature);
			
			this.$.feelsLike.setContent(data.apparentTemperature);
			this.$.minTemp.setContent(data.temperatureMin);
			this.$.maxTemp.setContent(data.temperatureMax);
			this.$.pop.setContent(data.precipProbability*100);
			this.$.humidity.setContent(data.humidity*100);
		}

		this.updateShowing();
	},

	updateShowing:function() {
		var data = this.getData();

		this.$.day.setShowing(data && this.getShowDay());
		this.$.weather.setShowing(data && this.getShowWeather() && data.hasOwnProperty('summary'));

		this.$.popRow.setShowing(data && this.getShowPop() && data.precipProbability);

		this.$.humidityRow.setShowing(data && this.getShowHumidity() && data.hasOwnProperty('humidity'));

		this.$.tempRange.setShowing(this.getShowRange() && data.hasOwnProperty('temperatureMax'));

		this.$.tempNow.setShowing(this.getShowTemp() && data.hasOwnProperty('temperature'));
	},

	transformDate:function(value) {
		if(this.getNow())
			return $L('now');
		if(value) {
			var date = new Date(value * 1000);

			if(this.getHourly()) {
				date.setMinutes(0);
				date.setSeconds(0);
				date.setMilliseconds(0);
				return Cumulus.Main.formatTime(date);
			}
			else {
				return Cumulus.Main.formatDay(date);
			}
		}
		return value;
	}
});
