enyo.singleton({
	name:"Service.Geolocation",

	getLocation:function() {
		var async = new enyo.Async();

		if(navigator.geolocation)
			navigator.geolocation.getCurrentPosition(
				function(position) {
					async.go(new enyo.Model( enyo.mixin(enyo.only(['latitude', 'longitude'], position.coords, {name: 'Geolocation'})) ));
				},
				function(error) {
					var reason = "";
					switch(error.code) {
						case error.PERMISSION_DENIED:
							reason = "GPS permission denied";
							break;
						case error.POSITION_UNAVAILABLE:
							reason = "GPS position unavailable";
							break;
						case error.TIMEOUT:
							reason = "GPS timed out";
							break;
						default:
							reason = "Unknown geolocation error";
							break;
					}
					
					async.fail({message:error.message, reason:reason, code:error.code});
				}
			);
		else
			enyo.asyncMethod(this,function() { async.fail({message:"Geolocation not available"}); });

		return async;
	}
});
