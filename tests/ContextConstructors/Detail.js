enyo.kind({
	name:"Cumulus.Testing.ContextConstructors.Detail",
	kind:"enyo.Async",

	go:function() {
		var self = this,
			detailContext = new Simple.Context("After the detail loads");

		detailContext.add(
			new Simple.Test("There should be two conditions", function() {
				return this.detail.$.conditionRepeater.getCount() == 2;
			}),
			new Simple.Test("The first condition should end when the second begins", function() {
				var timespans = this.detail.$.conditionRepeater.children.map(function(proxy) {
					return proxy.$.timespan.getContent();
				});

				var endOfFirst = timespans[0].match(/- ([\d:]+( [AP]M)?)/)[1];
				var beginningOfSecond = timespans[1].match(/([\d:]+( [AP]M)?)/)[1];

				return beginningOfSecond == endOfFirst;
			})
		);

		new enyo.Ajax({
			url:"tests/responses/hourlyForecast.json"
		}).go().response(function(ajax,response) {

			detailContext.setup = function() {
				this.detail = new Cumulus.Detail;
				detail.gotHourlyForecast(null,response);
			};

			self.respond(detailContext);

		}).error(function(ajax,error){
			alert("Couldn't load "+ajax.getUrl());
		});
	}
});
