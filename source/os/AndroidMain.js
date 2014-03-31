enyo.kind({
	name: 'cumulus.os.AndroidMain',
	kind: 'cumulus.Main',

	classes: 'android',

	initComponents: function() {
		this.createChrome([
			{kind: 'cumulus.widgets.AndroidMenubar'},
			{name: 'client'}
		]);
		this.inherited(arguments);
	}
});
