enyo.singleton({
	name:"webosCompatibility",
	components:[
		{kind:"Signals", onStageReady:"stageReady"}
	],

	constructor:function() {
		this.inherited(arguments);
		if(window.PalmSystem) {
			this.subscribeRelaunch();
			this.subscribeBack();
		}
	},

	subscribeBack:function() {
		enyo.dispatcher.listen(document, 'keyup', function(event) {
			if(event.keyCode == 27)
				enyo.Signals.send('onBackButton',event);
		});
	},

	subscribeRelaunch:function() {
		enyo.requiresWindow(function() {
			Mojo = window.Mojo || {};
			Mojo.relaunch = function() {
				var params = enyo.json.parse(PalmSystem.launchParams) || {};

				if(params['palm-command'] == 'open-app-menu')
					enyo.Signals.send("onToggleAppMenu");
				else
					enyo.Signals.send("onRelaunch", params);
			};
		});
	},

	stageReady:function() {
		if(window.PalmSystem)
			PalmSystem.stageReady();
	},

	showBanner:function(message, response, icon, soundClass, soundFile, soundDurationMs) {
		if(window.PalmSystem)
			PalmSystem.addBannerMessage(message, JSON.stringify(response || {}), icon, soundClass, soundFile, soundDurationMs);
	},
});
