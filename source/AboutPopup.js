enyo.kind({
	name:"Cumulus.AboutPopup",
	kind:"onyx.Popup",
	centered:true, floating:true, modal:true, scrim:true, scrimWhenModal:true,
	components:[
		{tag:"h1", content:"Cumulus"},
		{tag:"a", attributes:{href:"http://github.com/chrismondok"}, content:"Fork me on Github!"},
		{tag:"a", attributes:{href:"http://forecast.io"}, content:"Powered by Forecast"}
	]
})
