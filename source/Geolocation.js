enyo.singleton({
	name:"Weather.Geolocation",

	getLocation:function() {
		var async = new enyo.Async();

		navigator.geolocation.getCurrentPosition(
			function(position) {async.go(position.coords)},
			function(error) {async.fail(error)}
		);

		return async;
	}
});
