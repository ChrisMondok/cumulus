enyo.kind({
	name: 'cumulus.widgets.Marquee',
	classes: 'marquee-container',

	published:{
		speed: 32,
		delay: 2000,
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
		this.startJob('animate', '_animate', this.get('delay'));
	},

	_animate: function() {
		this.adjustTransitionDuration();
		enyo.dom.transform(this.$.client, {translate: -this.get('offset')+"px, 0px"});
	},

	adjustTransitionDuration: function(duration) {
		if(duration === undefined)
			duration = (this.get('offset')/this.get('speed'));
		if(typeof(duration) == 'number')
			duration += 's';

		//enyo.dom.transition doesn't take webOS into account? FOR SHAME!
		['-webkit-transition-duration','-moz-transition-duration','transition-duration'].forEach(function(p) {
			this.$.client.applyStyle(p, duration);
		}, this);
	},

	rewind: function() {
		this.adjustTransitionDuration('0s');
		this.stopJob('animate');
		enyo.dom.transform(this.$.client, {translate: "0px, 0px"});
	}
});
	

