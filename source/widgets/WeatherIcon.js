enyo.kind({
	name:"cumulus.WeatherIcon",
	
	classes:"icon-container",

	published:{
		icon:""
	},

	components:[
		{kind:"enyo.Image", src:"assets/weathericons/na.png", attributes:{alt:"weather icon"}}
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
