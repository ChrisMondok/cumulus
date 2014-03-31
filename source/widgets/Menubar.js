enyo.kind({
	name: 'cumulus.widgets.Menubar',
	classes: 'menubar'
});

enyo.kind({
	name: 'cumulus.widgets.AndroidMenubar',
	kind: 'cumulus.widgets.Menubar',

	layoutKind: 'FittableColumnsLayout',

	components:[
		{kind: 'onyx.IconButton', src: 'assets/icons/buttons/android-back.png', ontap: 'back'},
		{name: 'title', content: 'Cumulus', fit: true},
		{kind: 'onyx.IconButton', src: 'assets/icons/buttons/android-menu.png', ontap:'toggleMenu'},
		{kind: 'Signals', onTitleChanged:"onTitleChanged"}
	],

	onTitleChanged: function(sender, event) { this.$.title.setContent(event.title); },

	back: function() { enyo.Signals.send('onBackButton'); },
	toggleMenu: function() { enyo.Signals.send('onAppMenu'); }
});
