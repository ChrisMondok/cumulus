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
		showPop:true,

		feelsLikeThreshold:3
	},

	components:[
		{name:"icon", kind:"Cumulus.WeatherIcon"},
		{name:"day", classes:"day title", style:"display:inline-block", content:$L("Loading")},
		{name:"tempRange", classes:"temp-range", showing:false, content:"? / ?"},
		{name:"weather", classes:"weather"},
		{name:"tempNow", showing:false, components:[
			{tag:"span", name:"temp"},
			{tag:"span", classes:"label", content:"°F"},
			{tag:"span", classes:"feels-like", name:"feelsLikeContainer", components:[
				{tag:null, content:" (feels like "},
				{tag:"span", classes:"feels-like-value", name:"feelsLike"},
				{tag:null, content:" )"}
			]}
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
			
			this.$.temp.setContent(Math.round(data.temperature));
			
			this.$.feelsLike.setContent(Math.round(data.apparentTemperature));
			this.$.tempRange.setContent([
				Math.round(data.temperatureMax),
				Math.round(data.temperatureMin)
				].join(' / '));
			this.$.pop.setContent(Math.round(data.precipProbability*100));
			this.$.humidity.setContent(Math.round(data.humidity*100));
		}

		this.updateShowing();
	},

	updateShowing:function() {
		var data = this.getData();
		var showFeelsLike = this.getShowTemp() && data.hasOwnProperty('temperature') && data.hasOwnProperty('apparentTemperature') && Math.abs(data.temperature - data.apparentTemperature) > this.getFeelsLikeThreshold();

		this.$.day.setShowing(data && this.getShowDay());
		this.$.weather.setShowing(data && this.getShowWeather() && data.hasOwnProperty('summary'));

		this.$.popRow.setShowing(data && this.getShowPop() && data.precipProbability);

		this.$.humidityRow.setShowing(data && this.getShowHumidity() && data.hasOwnProperty('humidity'));

		this.$.tempRange.setShowing(this.getShowRange() && data.hasOwnProperty('temperatureMax'));

		this.$.tempNow.setShowing(this.getShowTemp() && data.hasOwnProperty('temperature'));

		this.$.feelsLike.setShowing(showFeelsLike);
		this.$.feelsLikeContainer.setShowing(showFeelsLike);
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
				return Cumulus.Main.formatDay(date);
			}
		}
		return value;
	}
});
