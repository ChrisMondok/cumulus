enyo.kind({
	name:"Weather.Normals",
	kind:"FittableRows",

	published:{
		sunrise:null,
		sunset:null
	},

	bindings:[
		{from:"sunrise", to:".$.sunrise.content", transform:"timeFromDateString"},
		{from:"sunset", to:".$.sunset.content", transform:"timeFromDateString"},
	],

	components:[
		{kind:"FittableColumns", classes:"row", controlClasses:"halfwidth", components:[
			{components:[
				{kind:"Image", src:"assets/icons/Sunrise.png"},
				{name:"sunrise", tag:"span"}
			]},
			{components:[
				{kind:"Image", src:"assets/icons/Sunset.png"},
				{name:"sunset", tag:"span"}
			]}
		]}
	],

	setData:function(data) {
		this.setSunrise(data.sunriseISO);
		this.setSunset(data.sunsetISO);
	},

	setSunMoon:function(normals) {
		this.setSunrise(normals.sun.riseISO);
		this.setSunset(normals.sun.setISO);
	},
	
	timeFromDateString:function(dateString) {
		return new Date(dateString).toLocaleTimeString();
	}
});
