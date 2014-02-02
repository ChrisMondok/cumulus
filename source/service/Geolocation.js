enyo.singleton({
	name:"Service.Geolocation",

	getLocation:function() {
		var async = new enyo.Async();

		if(navigator.geolocation)
			navigator.geolocation.getCurrentPosition(
				function(position) {async.go(position.coords);},
				function(error) {
					var message = "";
					switch(error.code) {
						case error.PERMISSION_DENIED:
							message = "GPS permission denied";
							break;
						case error.POSITION_UNAVAILABLE:
							message = "GPS position unavailable";
							async.go({latitude: 40.20854, longitude: -74.05034});
							return;
							break;
						case error.TIMEOUT:
							message = "GPS timed out";
							break;
						default:
							message = "Unknown geolocation error";
							break;
					}
					
					async.fail({message:error.message, code:error.code});
				}
			);
		else
			enyo.asyncMethod(this,function() { async.fail({message:"Geolocation not available"}); });

		return async;
	}
});
