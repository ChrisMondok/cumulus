enyo.kind({
	name: 'cumulus.AboutPopup',
	kind: 'onyx.Popup',
	autoDismiss: false,
	centered:true, floating:true, modal:true, scrim:true, scrimWhenModal:true,
	components:[
		{tag:'header', content:'Cumulus'},
		{tag:'a', attributes:{href:'http://github.com/chrismondok'}, content:"Fork me on Github!"},
		{tag:'a', attributes:{href:'http://forecast.io'}, content:"Powered by Forecast"},
		{tag:'footer', components:[
			{kind: 'onyx.Button', classes:'onyx-dark', content: "Close", ontap: 'back'}
		]}
	],

	back: function() {
		console.log('back');
		enyo.Signals.send('onBackButton');
	}
});
