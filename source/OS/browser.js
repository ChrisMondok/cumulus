enyo.singleton({
	name:"browserCompatibility",
	constructor:function() {
		this.inherited(arguments);
		if(!window.PalmSystem) {
			enyo.dispatcher.listen(document,'keyup', function(event) {
				if(event.ctrlKey && event.keyCode == 192)
					enyo.Signals.send('onToggleAppMenu');
			});
		}
	}
});
