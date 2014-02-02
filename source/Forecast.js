(function() {

var roundOrNull = function(value) {
	if(typeof(value) == 'number')
		return Math.round(value);
	return null;
}
enyo.kind({
	name: "Cumulus.Forecast",

	classes: "row forecast nice-padding",

	published: {
		model: null,

		now: false,
		hourly: false,

		showDay: true,
		showHumidity: false,
		showTemp: true,
		showRange: true,
		showWeather: true,
		showPop: true,

		feelsLikeThreshold: 3
	},

	bindings: [
		{from: '.model.summary', to: '.$.summary.content'},
		{from: '.model.icon', to: '.$.icon.icon'},
		{from: '.model.precipProbability', to: '.$.pop.content', transform: function(value){return Math.round(100*value);}},
		{from: '.model.precipProbability', to: '.$.popRow.showing', transform: function(value){return Boolean(value);}},
		{from: '.model.temperatureMax', to: '.$.tempMax.content', transform: roundOrNull},
		{from: '.model.temperatureMin', to: '.$.tempMin.content', transform: roundOrNull},
		{from: '.model.time', to: '.$.day.content', transform: function(value, direction, binding) {
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
		}}
	],

//	tempRange: function(a,b,c) {
//		console.log("COMPUTE TEMP RANGE");
//		var model = this.get('model');
//		if(!model)
//			return null;
//		var high = model.get('temperatureMax'), low = model.get('temperatureMin');
//
//		if( high === undefined || low === undefined)
//			return null;
//
//		return [Math.round(high), Math.round(low)].join(' / ');
//	},

	components: [
		{name: "icon", kind: "Cumulus.WeatherIcon"},
		{name: "day", classes: "day title", style: "display: inline-block", content: $L("Loading")},
		{name: "tempRange", classes: "temp-range", showing: true, components: [
			{tag: 'span', name: 'tempMax'},
			{tag: 'span', content: ' / '},
			{tag: 'span', name: 'tempMin'}
		]},
		{name: "summary", classes: "weather"},
		{name: "tempNow", showing: true, components: [
			{tag: "span", name: "temp"},
			{tag: "span", classes: "label", content: "°F"},
			{tag: "span", classes: "feels-like", name: "feelsLikeContainer", components: [
				{tag: null, content: " (feels like "},
				{tag: "span", classes: "feels-like-value", name: "feelsLike"},
				{tag: null, content: " )"}
			]}
		]},
		{name: "popRow", showing: false, components: [
			{tag: "span", name: "pop"},
			{tag: "span", classes: "label", content: "% chance of precipitation"}
		]},
		{name: "humidityRow", showing: false, components: [
			{tag: "span", name: "humidity"},
			{tag: "span", classes: "label", content: "% humidity"}
		]}
	],

	dataChanged: function() {
		return;
		var data = this.getData();
		if(data) {
			
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

	updateShowing: function() {
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
	}
});
})();
