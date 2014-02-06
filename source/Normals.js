enyo.kind({
	name:"Cumulus.Normals",

	bindings:[
		{from: '.model.sunriseTime', to: '.$.sunrise.content', transform: Cumulus.Main.formatTime},
		{from: '.model.sunsetTime', to: '.$.sunset.content', transform: Cumulus.Main.formatTime}
	],

	create: function() {
		this.inherited(arguments);
		window.N = this;
	},

	components:[
		{content:"Sun", classes:"divider"},
		{kind:"FittableColumns", controlClasses:"halfwidth", classes:"sunmoon group", components:[
			{name:"sunrise", classes:"sunrise"},
			{name:"sunset", classes:"sunset"}
		]}
//		{name:"tideDrawer", kind:"Drawer", open:false, components:[
//			{content:"Tides", classes:"divider"},
//			{name:"tideRepeater", kind:"Repeater", tag:"table", classes:"tide-table group", onSetupItem:"renderTide", components:[
//				{tag:"tr", components:[
//					{name:"type", tag:"td"},
//					{name:"height", tag:"td"},
//					{name:"time", tag:"td"}
//				]}
//			]}
//		]}
	]
});
