enyo.kind({
	name: 'cumulus.widgets.Marquee',
	classes: 'marquee-container',

	published:{
		speed: 32,
		delay: 2000,
		resetDelay: 5000,
		active: true
	},

	observers:{
		triggerPlayback: ['offset', 'active']
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
		this.triggerPlayback();
	},

	triggerPlayback: function() {
		if(this.get('offset') && this.get('active'))
			this.animate();
		else
			this.rewind();
	},

	animate: function() {
		this.stopJob('rewind');
		this.startJob('animate', '_animate', this.get('delay'));
	},

	_animate: function() {
		var duration = this.calculateTransitionDuration();
		this.adjustTransitionDuration(duration);
		enyo.dom.transform(this.$.client, {translate: -this.get('offset')+"px, 0px"});

		if(duration)
			this.startJob('rewind', 'animateRewind', duration + this.get('resetDelay'));
		else
			this.stopJob('rewind');
	},

	calculateTransitionDuration: function() {
		return (this.get('offset') / this.get('speed')) * 1000;
	},

	adjustTransitionDuration: function(duration) {
		var d = duration / 1000 + 's';
		//enyo.dom.transition doesn't take webOS into account? FOR SHAME!
		['-webkit-transition-duration','-moz-transition-duration','transition-duration'].forEach(function(p) {
			this.$.client.applyStyle(p, d);
		}, this);

		return duration;
	},

	rewind: function() {
		this.adjustTransitionDuration(0);
		this.stopJob('animate');
		enyo.dom.transform(this.$.client, {translate: "0px, 0px"});
	},

	animateRewind: function() {
		this.adjustTransitionDuration(500);
		this.stopJob('animate');
		enyo.dom.transform(this.$.client, {translate: "0px, 0px"});
	}
});
	

