enyo.kind({
	name: 'cumulus.os.AndroidMain',
	kind: 'FittableRows',

	classes: 'android',

	components:[
		{kind: 'cumulus.widgets.AndroidMenubar'},
		{kind: 'cumulus.Main', fit: true}
	]
})
