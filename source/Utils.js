enyo.singleton({
	name:"cumulus.Utils",

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
	}
});
