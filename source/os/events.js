(function() {
	enyo.ready(function() {
		handleCtrlTilde();
		handleEscape();
		handleWebosEvents();
		handleCordovaEvents();

		if(window.PalmSystem)
			PalmSystem.stageReady();
	});

	var handleEscape = function() {
		var signal = (window.PalmSystem ? 'onBackButton' : 'onEscape');
		enyo.dispatcher.listen(document, 'keyup', function(event) {
			if(event.keyCode == 27)
				enyo.Signals.send(signal,event);
		});
	};

	var handleCtrlTilde = function() {
		enyo.dispatcher.listen(document,'keyup', function(event) {
			if(event.ctrlKey && event.keyCode == 192)
				enyo.Signals.send('onAppMenu');
		});
	};

	handleCordovaEvents = function() {
		if(window.cordova) {
			document.addEventListener('menubutton', function() {
				enyo.Signals.send('onAppMenu');
			}, false);
			document.addEventListener('backbutton', function() {
				enyo.Signals.send('onBackButton');
			});
		}
	};

	var handleWebosEvents = function() {
		if(window.PalmSystem) {
			Mojo = window.Mojo || {};

			Mojo.stageActivated = function() {
				enyo.Signals.send('onActivate');
			};

			Mojo.stageDeactivated = function() {
				enyo.Signals.send('onDeactivate');
			};

			Mojo.lowMemoryNotification = function(params) {
				enyo.Signals.send('onLowMemory', params);
			};

			Mojo.relaunch = function() {
				var params = enyo.json.parse(PalmSystem.launchParams) || {};
				enyo.Signals.send("onRelaunch", params);
				if(params['palm-command'] == 'open-app-menu')
					enyo.Signals.send("onAppMenu");
			};
		}
	};
})();
