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

	statics:{
		formatTime:function(date) {
			var hour = date.getHours() % 12;
			if(!hour)
				hour = 12;
			var minutes = date.getMinutes();
			if(minutes < 10)
				minutes = "0"+minutes;
			var ampm = ["AM","PM"][Math.floor(date.getHours()/12)]
			return hour+":"+minutes+" "+ampm;
		},
	},

	create:function() {
		this.inherited(arguments);
		this.setApi(new Weather.API);
		window.addEventListener('popstate',enyo.bind(this,'stateChanged'));
		window.INSTANCE = this;
	},

	rendered:function() {
		this.inherited(arguments);
		this.stateChanged();
	},

	apiChanged:function() {
		this.waterfall("onApiCreated",{api:this.getApi()},this);
	},

	pushDayPickedState:function(sender,event) {
		if(history.pushState) {
			history.pushState({data:event.data, top:event.top, index:1}, "Hourly Forecast");
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
		{
			this.$.detail.setData(null);
			this.$.panels.setIndex(0);
		}
	},

	showDetail:function(sender,event) {
		if(!this.$.panels.getIndex() && event.top) {
			this.$.detailForecastAnimator.play({startValue:event.top, endValue:0});
			this.$.detail.$.today.applyStyle('position','relative');
		}
		this.$.panels.setIndex(1);
		this.$.detail.setData(event.data);
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
		this.$.detail.$.today.applyStyle('position','');
		this.$.detail.$.today.setBounds({
			top:"0",
			left:"0"
		});
	}
});
