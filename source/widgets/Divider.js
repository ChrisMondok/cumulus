enyo.kind({
	name:"Cumulus.Divider",
	kind:"FittableColumns",
	noStretch:true,

	classes:"divider",

	published:{
		content:"Divider"
	},

	components:[
		{classes:"divider-line left", tag:"div"},
		{name: "content", classes: "divider-label", isChrome: true},
		{classes:"divider-line right", tag:"div", fit:true}
	],

	create:function() {
		this.inherited(arguments);
		this.contentChanged();
	},

	contentChanged:function() {
		this.$.content.setContent(this.getContent());
	}
});
