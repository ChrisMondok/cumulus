enyo.kind({
	name:"Cumulus.Normals",

	published:{
		tides:null
	},

	components:[
		{content:"Sun", classes:"divider"},
		{kind:"FittableColumns", controlClasses:"halfwidth", classes:"sunmoon group", components:[
			{name:"sunrise", classes:"sunrise"},
			{name:"sunset", classes:"sunset"}
		]},
		{name:"tideDrawer", kind:"Drawer", open:false, components:[
			{content:"Tides", classes:"divider"},
			{name:"tideRepeater", kind:"Repeater", tag:"table", classes:"tide-table group", onSetupItem:"renderTide", components:[
				{tag:"tr", components:[
					{name:"type", tag:"td"},
					{name:"height", tag:"td"},
					{name:"time", tag:"td"}
				]}
			]}
		]}
	],

	setData:function(data) {
		if(data && data.sunriseTime && data.sunsetTime)
		{
			this.$.sunrise.setContent(this.timeFromDateString(data.sunriseTime));
			this.$.sunset.setContent(this.timeFromDateString(data.sunsetTime));
		}
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

		item.$.type.setContent( {h:$L("High"),l:$L("Low")}[tide.type] );

		item.$.height.setContent([tide.heightFT,$L("FT")].join(' '));

		item.$.time.setContent(this.timeFromDateString(tide.dateTimeISO));
	}
});
