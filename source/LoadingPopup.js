enyo.kind({
	name:"Weather.LoadingPopup",
	kind:"Popup",
	
	published:{
		centered:true,
		autoDismiss:false
	},

	components:[
		{kind:"onyx.Spinner"}
	]
});
