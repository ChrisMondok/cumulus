enyo.singleton({
	name:"cumulus.Utils",

	lerp: function(a, b, i) {
		return b*i + a*(1-i);
	},

	getGeoDistance:function(latitude, longitude, targetlat, targetlon) {

		var degToRad = function(degrees) {
			return (degrees/180)*Math.PI;
		};

		var earthRadius = 6371,
			lat1 = degToRad(latitude),
			lon1 = degToRad(longitude),
			lat2 = degToRad(targetlat),
			lon2 = degToRad(targetlon),
			dLat = lat2 - lat1,
			dLon = lon2 - lon1;

		var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)*Math.sin(dLon/2);
		var c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
		var distanceInKm = earthRadius*c;
		return Math.round(distanceInKm*62.1371)/100;
	},

	formatTime: function(date) {
		if (typeof date == 'number')
			date = new Date(date);

		var hour = date.getHours() % 12;
		if(!hour)
			hour = 12;
		var minutes = date.getMinutes();
		if(minutes < 10)
			minutes = "0"+minutes;
		var ampm = ["AM","PM"][Math.floor(date.getHours()/12)];
		return hour+ ":" +minutes+" "+ampm;
	},

	formatDay: function(date) {
		if (typeof date == 'number')
			date = new Date(date);

		date.setHours(0,0,0,0);

		var today = new Date();
		today.setHours(0,0,0,0);

		if(today - date === 0)
			return $L("today");
		else
			return $L(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()]);
	},
	
	formatNumber: function(value) {
		if(typeof(value) == 'number')
			return Math.round(value);
		return null;
	}
});
