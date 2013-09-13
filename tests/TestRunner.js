enyo.kind({
	name:"Cumulus.Testing.TestRunner",
	kind:"FittableRows",
	classes:"enyo-fit testing onyx",

	published:{
		contexts:undefined
	},

	_uninitialized:null,

	components:[
		{kind:"Scroller", fit:true, components:[
			{name:"contextRepeater", kind:"Repeater", onSetupItem:"setupContext", components:[
				{name:"contextDisplay", kind:"Cumulus.Testing.ContextDisplay"}
			]}
		]},
		{kind:"onyx.Toolbar", components:[
			{kind:"onyx.Button", content:"Run", ontap:"runTests"}
		]}
	],

	rendered:function() {
		this.inherited(arguments);

		this._uninitialized = [];

		for(var c in Cumulus.Testing.ContextConstructors)
		{
			var a = new Cumulus.Testing.ContextConstructors[c];
			this._uninitialized.push(a);
			a.response(this,'contextReady').go();	
		}
	},

	contextReady:function(ctr, context) {
		this._uninitialized.splice(this._uninitialized.indexOf(ctr),1);
		this.setContexts((this.getContexts() || []).concat(context));
	},

	contextsChanged:function() {
		if(!this._uninitialized.length)
			this.$.contextRepeater.setCount(this.getContexts().length);
	},

	setupContext:function(repeater, event) {
		event.item.$.contextDisplay.setContext(context = this.getContexts()[event.index]);
		
		return true;
	},

	runTests:function() {
		var contexts = this.getContexts();
		for(var i = 0; i < contexts.length; i++)
		{
			contexts[i].run();
			this.waterfall("onContextRan",{context:contexts[i]});
		}
	}
});
