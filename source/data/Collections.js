enyo.kind({
	name: 'Cumulus.collections.Base',
	kind: 'enyo.Collection',
	defaultSource: 'forecast'
});

enyo.kind({
	name:'Cumulus.collections.Daily',
	kind: 'Cumulus.collections.Base',
	model: 'Cumulus.models.Daily'
});

enyo.kind({
	name: 'Cumulus.collections.Hourly',
	kind: 'Cumulus.collections.Base',
	model: 'Cumulus.models.Hourly'
});

enyo.kind({
	name: 'Cumulus.collections.Conditions',
	kind: 'Cumulus.collections.Base',
	model: 'Cumulus.models.Condition'
});
