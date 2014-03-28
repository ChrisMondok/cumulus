enyo.singleton({
	name:"webosCompatibility",

	showBanner:function(message, response, icon, soundClass, soundFile, soundDurationMs) {
		if(window.PalmSystem)
			PalmSystem.addBannerMessage(message, JSON.stringify(response || {}), icon, soundClass, soundFile, soundDurationMs);
		else
			console.log("BANNER: "+message);
	}
});
