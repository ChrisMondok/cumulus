Cumulus.Testing.ContextConstructors = Cumulus.Testing.ContextConstructors || [];

(function(scope){
	var async = new enyo.Async();

	async.go = function() {
		var detailContext = new Simple.Context("Conditions");

		var req = new XMLHttpRequest();
		req.open("GET","tests/responses/forecasts.json"); //man this sucks.
		req.addEventListener('load', function() {
			var periods = JSON.parse(this.responseText);

			detailContext.setup = function() {
				this.detail = new Cumulus.Detail;
				detail.gotHourlyForecast(null,periods);
			};

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

			async.respond(detailContext);
		});
		
		req.send();
	};

	scope.push(async);

})(Cumulus.Testing.ContextConstructors);
