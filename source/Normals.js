enyo.kind({
	name:"Cumulus.Normals",
	kind:"FittableRows",

	published:{
		sunrise:null,
		sunset:null,
		tides:null,
	},

	bindings:[
		{from:"sunrise", to:".$.sunrise.content", transform:"timeFromDateString"},
		{from:"sunset", to:".$.sunset.content", transform:"timeFromDateString"},
	],

	components:[
		{kind:"Divider", content:"Sun"},
		{kind:"FittableColumns", controlClasses:"halfwidth", classes:"sunmoon", components:[
			{components:[
				{kind:"Image", src:"assets/icons/sunrise.png"},
				{name:"sunrise", tag:"span"}
			]},
			{components:[
				{kind:"Image", src:"assets/icons/sunset.png"},
				{name:"sunset", tag:"span"}
			]}
		]},
		{name:"tideDrawer", kind:"Drawer", open:false, components:[
			{kind:"Divider", content:"Tides"},
			{name:"tideRepeater", kind:"Repeater", tag:"table", classes:"tide-table", onSetupItem:"renderTide", components:[
				{tag:"tr", components:[
					{name:"type", tag:"td"},
					{name:"height", tag:"td"},
					{name:"time", tag:"td"}
				]},
			]},
		]},
	],

	setData:function(data) {
		this.setSunrise(data && data.sunriseISO || null);
		this.setSunset(data && data.sunsetISO || null);
	},

	setSunMoon:function(normals) {
		this.setSunrise(normals && normals.sun.riseISO || null);
		this.setSunset(normals && normals.sun.setISO || null);
	},
	
	timeFromDateString:function(dateString) {
		if(dateString)
			return Cumulus.Main.formatTime(new Date(dateString));
		else
			return "";
	},

	tidesChanged:function() {
		var tides = this.getTides();

		if(tides)
		{
			this.$.tideRepeater.setCount(tides.length);
			this.$.tideDrawer.setOpen(true);
		}
		else
			this.$.tideDrawer.setOpen(false);
	},

	renderTide:function(sender,event) {
		var item = event.item, index = event.index, tide = this.getTides()[index];

		item.$.type.setContent(
			{
				h:$L("High"),
				l:$L("Low")
			}[tide.type]
		);

		item.$.height.setContent([tide.heightFT,$L("FT")].join(' '));

		item.$.time.setContent(this.timeFromDateString(tide.dateTimeISO));
	}
});
