enyo.kind({
	name:"cumulus.LoadingPopup",
	kind:"Popup",
	
	published:{
		centered:true,
		autoDismiss:false
	},

	components:[
		{kind:"cumulus.Spinner"}
	]
});
