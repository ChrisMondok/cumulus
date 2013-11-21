enyo.depends(
	"$lib/layout",
	"$lib/onyx",	// To theme Onyx using Theme.less, change this line to $lib/onyx/source,
	//"Theme.less",	// uncomment this line, and follow the steps described in Theme.less
	"OS",
	"Service",
	"Widgets",
	"API",

	"Main.js",
	"Outlook.js",
	"Preferences.js",
	"Advisory.js",
	"Forecast.js",
	"MinutelyForecast.js",
	"Detail.js",
	"Normals.js",
	"TemperatureGraph.js",
	
	"Cumulus.css",
	"map.css",
	"detail.css",
	"forecast.css",
	"outlook.css",
	"minutelyForecast.css",
	"advisory.css"
);
