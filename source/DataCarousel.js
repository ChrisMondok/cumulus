enyo.kind({
	name: 'Cumulus.DataCarousel',
	kind: 'DataRepeater',
	selection: false,

	arrangerKind: 'CarouselArranger',

	containerOptions:{
		kind: 'enyo.Panels',
		arrangerKind: 'CarouselArranger',
		onTransitionFinish: 'transitionFinished',
		classes: 'enyo-fit'
	},

	published:{
		model: null
	},

	transitionFinished: function(sender, e) {
		if(this.collection)
			this.set('model', this.collection.at(e.toIndex));
	},

	collectionChanged: function(old, collection) {
		this.inherited(arguments);
		this.$.container.setIndexDirect(0);
		if(collection)
			this.set('model', collection.at(0));
		else
			this.set('model', null);
	},

	modelChanged: function(old, model) {
		if(model && this.collection) {
			var index = this.collection.indexOf(model);
			if(index == -1)
				this.$.container.setIndexDirect(0);
			else
				this.$.container.setIndexDirect(index);
		}
	}
});
