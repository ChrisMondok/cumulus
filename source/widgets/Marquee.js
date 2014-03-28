enyo.kind({
	name: 'cumulus.widgets.Marquee',
	classes: 'marquee-container',

	published:{
		speed: 32
	},

	create: function() {
		this.inherited(arguments);
		if(!window.Marquee)
			window.Marquee = this;
	},

	initComponents: function() {
		this.createChrome([
			{name: 'client', classes:'marquee'}
		]);
		this.inherited(arguments);
	},

	resizeHandler:function() {
		this.inherited(arguments);
		this.set('offset', Math.max(0, this.$.client.getBounds().width - this.getBounds().width));
		this.startJob('animate', 'animate', 2000);
	},

	offsetChanged: function(oldOffset, offset) {
		if(offset) {
			this.animate();
		}
		else
			this.rewind();
	},

	animate: function() {
		this.adjustTransitionDuration();
		enyo.dom.transform(this.$.client, {translate: -this.get('offset')+"px, 0px"});
	},

	adjustTransitionDuration: function() {
		//enyo.dom.transition doesn't take webOS into account? FOR SHAME!
		this.$.client.applyStyle('-webkit-transition-duration', (this.get('offset')/this.get('speed'))+'s');
		this.$.client.applyStyle('-moz-transition-duration', (this.get('offset')/this.get('speed'))+'s');
		this.$.client.applyStyle('transition-duration', (this.get('offset')/this.get('speed'))+'s');
	},

	rewind: function() {
		console.log("REWIND");
		this.adjustTransitionDuration();
		enyo.dom.transform(this.$.client, {translate: "0px, 0px"});
	}
});
	

