enyo.kind({
	name: 'cumulus.widgets.Marquee',
	classes: 'marquee-container',

	published:{
		speed: 32,
		active: true
	},

	observers:{
		triggerPlayback: ['offset', 'active']
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

	triggerPlayback: function() {
		if(this.get('offset') && this.get('active'))
			this.animate();
		else
			this.rewind();
	},

	animate: function() {
		this.adjustTransitionDuration();
		enyo.dom.transform(this.$.client, {translate: -this.get('offset')+"px, 0px"});
	},

	adjustTransitionDuration: function(duration) {
		//enyo.dom.transition doesn't take webOS into account? FOR SHAME!
		if(duration === undefined)
			duration = (this.get('offset')/this.get('speed'))+'s';
		if(typeof('duration') == 'number')
			duration += 's';
		this.$.client.applyStyle('-webkit-transition-duration', duration);
		this.$.client.applyStyle('-moz-transition-duration', duration);
		this.$.client.applyStyle('transition-duration', duration);
	},

	rewind: function() {
		this.adjustTransitionDuration('0s');
		enyo.dom.transform(this.$.client, {translate: "0px, 0px"});
	}
});
	

