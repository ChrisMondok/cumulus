enyo.singleton({
	name:"Service.Geolocation",

	getLocation:function() {
		var async = new enyo.Async();

		if(navigator.geolocation)
			navigator.geolocation.getCurrentPosition(
				function(position) {async.go(position.coords);},
				function(error) {async.fail(error);}
			);
		else
			enyo.asyncMethod(this,function() {async.fail();});

		return async;
	}
});
