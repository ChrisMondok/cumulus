enyo.kind({
	name:"Cumulus.Testing.ContextDisplay",

	published:{
		context:null
	},

	handlers:{
		onContextRan:"resultsMightHaveChanged"
	},

	components:[
		{kind:"FittableColumns", classes:"context-row", ontap:"toggleDrawer", components:[
			{name:"name", fit:true},
			{name:"count"}
		]},
		{name:"drawer", kind:"Drawer", classes:"context-drawer", components:[
			{name:"resultRepeater", kind:"Repeater", onSetupItem:"setupTest", components:[
				{kind:"FittableColumns", classes:"test-row", components:[
					{name:"name", fit:true},
					{name:"result"}
				]}
			]}
		]}
	],

	contextChanged:function() {
		var context = this.getContext(),
			results = context.getResults(),
			count = Object.keys(results).length;

		this.$.name.setContent(context.name);
		this.$.count.setContent(count+ " tests");

		this.$.resultRepeater.setCount(count);
	},

	setupTest:function(repeater, event) {
		var item = event.item,
			results = this.getContext().getResults(),
			name = Object.keys(results)[event.index];

		item.$.name.setContent(name);
		item.$.result.setContent(String(results[name]));

		return true;
	},

	toggleDrawer:function() {
		this.$.drawer.setOpen(!this.$.drawer.getOpen());
	},

	resultsMightHaveChanged: function() {
		this.$.resultRepeater.build();
	}
});
