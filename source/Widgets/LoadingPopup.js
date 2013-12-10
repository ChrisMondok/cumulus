enyo.kind({
	name:"Cumulus.LoadingPopup",
	kind:"Popup",
	
	published:{
		centered:true,
		autoDismiss:false
	},

	components:[
		{kind:"Cumulus.Spinner"}
	]
});
