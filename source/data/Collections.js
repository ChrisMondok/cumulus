enyo.kind({
	name: 'cumulus.collections.Base',
	kind: 'enyo.Collection',
	defaultSource: 'forecast'
});

enyo.kind({
	name:'cumulus.collections.Daily',
	kind: 'cumulus.collections.Base',
	model: 'cumulus.models.Daily'
});

enyo.kind({
	name: 'cumulus.collections.Hourly',
	kind: 'cumulus.collections.Base',
	model: 'cumulus.models.Hourly'
});

enyo.kind({
	name: 'cumulus.collections.Conditions',
	kind: 'cumulus.collections.Base',
	model: 'cumulus.models.Condition'
});
