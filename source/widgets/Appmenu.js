enyo.kind({
	name: 'cumulus.Appmenu',
	kind: 'enyo.Popup',
	defaultKind: 'enyo.Button',
	modal: true,

	classes: 'appmenu',

	handlers:{
		ontap: 'tapHandler'
	},

	tapHandler: function() {
		this.hide();
	}
});
