enyo.kind({
	name: 'cumulus.widgets.Menubar',

	classes: 'menubar'
});

enyo.kind({
	name: 'cumulus.widgets.AndroidMenubar',
	kind: 'cumulus.widgets.Menubar',

	layoutKind: 'FittableColumnsLayout',

	components:[
		{content: 'Back'},
		{name: 'title', content: 'Cumulus', fit: true},
		{kind: 'onyx.IconButton', src: 'assets/icons/buttons/android-menu.png', ontap:'toggleMenu'},
		{kind: 'Signals', onTitleChanged:"titleChanged"}
	],

	titleChanged: function(sender, event) {
		this.$.title.setContent(event.title);
	},

	toggleMenu: function() {
		enyo.Signals.send('onAppMenu');
	}
});
