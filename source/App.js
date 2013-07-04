enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
	published:{
		api:null
	},

	components:[
		{kind:"Panels", fit:true, components:[
			{
				name:"outlook",
				kind:"Weather.Outlook",
				place:{lat:40.208567, lon:-74.050383}
			},
			{kind:"Weather.Settings"}
		]},
	],

	create:function() {
		this.inherited(arguments);
		this.setApi(new Weather.API);
	},

	apiChanged:function() {
		this.waterfall("onApiCreated",{api:this.getApi()},this);
	}
});
