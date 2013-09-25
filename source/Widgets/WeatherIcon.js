enyo.kind({
	name:"Cumulus.WeatherIcon",
	
	classes:"icon-container",

	published:{
		icon:""
	},

	components:[
		{kind:"enyo.Image", src:"assets/weathericons/na.png"}
	],

	iconChanged:function() {
		this.$.image.setSrc(this.transformIcon(this.getIcon()));
	},

	transformIcon:function(value) {
		if(value) 
			return "assets/weathericons/"+value+".png";
		return value;
	}
});
