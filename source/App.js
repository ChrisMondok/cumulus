enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
	published:{
		api:null
	},

	handlers:{
		onDayPicked:"pushDayPickedState"
	},

	components:[
		{name:"detailForecastAnimator", kind:"Animator", onStep:"animateDetailForecast", onEnd:"repositionDetailForecast"},
		{kind:"Signals", onBackButton:"onBackGesture"},
		{name:"panels", kind:"Panels", arrangerKind:"CardSlideInArranger", fit:true, draggable:false, components:[
			{
				name:"outlook",
				kind:"Weather.Outlook",
				place:{lat:40.208567, lon:-74.050383}
			},
			{
				name:"detail",
				kind:"Weather.Detail",
				place:{lat:40.208567, lon:-74.050383}
			},
			{kind:"Weather.Settings"}
		]},
	],

	create:function() {
		this.inherited(arguments);
		this.setApi(new Weather.API);
		window.addEventListener('popstate',enyo.bind(this,'stateChanged'));
	},


	apiChanged:function() {
		this.waterfall("onApiCreated",{api:this.getApi()},this);
	},

	pushDayPickedState:function(sender,event) {
		if(history.pushState) {
			history.pushState({data:event.data, top:event.top, index:1}, "Details", "#details");
			this.stateChanged();
		}
		else
			this.showDetail(sender,event);
	},

	onBackGesture:function(sender,event) {
		if(this.$.panels.getIndex()) {
			this.back();
			event.stopPropagation();
			event.preventDefault();
			return -1;
		}
	},

	back:function(sender,event) {
			if(history.popState)
				history.popState();
			else
				this.$.panels.previous();
	},

	stateChanged:function() {
		if(history.state) {
			switch(history.state.index) {
				case 1:
					this.showDetail(this,history.state);
					break;
			}
		}
		else
			this.$.panels.setIndex(0);
	},

	showDetail:function(sender,event) {
		this.$.panels.setIndex(1);
		this.$.detail.setData(event.data);
		if(event.top) {
			this.$.detailForecastAnimator.setDuration(this.$.panels.getAnimator().getDuration());
			this.$.detailForecastAnimator.play({startValue:event.top, endValue:0});
			this.$.detail.$.today.applyStyle('position','relative');
		}
	},

	animateDetailForecast:function(animator,event) {
		var slideValue = 1-this.$.panels.getAnimator().value;
		var left = -this.$.outlook.getBounds().width*(slideValue)+"px";
		this.$.detail.$.today.setBounds({
			top:animator.value+"px",
			left:left
		});
	},

	repositionDetailForecast:function(animator,event) {
		this.$.detail.$.today.applyStyle('position','')
	}
});
