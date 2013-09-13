enyo.kind({
	name:"Cumulus.Testing.ContextConstructors.Outlook",
	kind:"enyo.Async",

	go:function() {
		var self = this,
			context = new Simple.Context("After the outlook loads");

		context.add(
			new Simple.Test("The current conditions should be visible.", function() {
				return this.outlook.$.observations.$.tempNow.getShowing();
			}),
			new Simple.Test("The current temperature should be 79°F", function() {
				return this.outlook.$.observations.$.temp.getContent() == "79°F";
			})
		);

		new enyo.Ajax({
			url:"tests/responses/observations.json"
		}).go().response(function(ajax,response) {

			context.setup = function() {
				this.outlook = new Cumulus.Outlook;
				this.outlook.gotObservations(ajax,response);
			};

			self.respond(context);

		}).error(function(ajax,error){
			alert("Couldn't load "+ajax.getUrl());
		});
	}
});
