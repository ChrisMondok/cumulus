enyo.kind({
	name: 'Cumulus.LocalStorageSource',
	kind: 'enyo.LocalStorageSource',

	fetch: function(record, options) {
		var url = this.buildUrl(record, options);

		var loaded = localStorage.getItem(url);
		
		if(loaded)
			options.success(JSON.parse(loaded));
		else
			options.fail();
	},

	buildUrl: function(record, options) {
		return options.id || (enyo.isFunction(record.getUrl) && record.getUrl()) || record.url;
	},

	find: function(ctor, options) {
		return this.fetch(ctor, options);
	},

	commit: function(record, options) {
		localStorage.setItem(this.buildUrl(record, options), record.toJSON());
	}
});
