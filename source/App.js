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
		{name:"detailForecastAnimator", kind:"Animator", duration:250, onStep:"animateDetailForecast", onEnd:"repositionDetailForecast"},
		{kind:"Signals", onBackButton:"onBackGesture"},
		{name:"panels", kind:"Panels", arrangerKind:"CardArranger", fit:true, draggable:false, components:[
			{
				name:"outlook",
				kind:"Weather.Outlook",
			},
			{
				name:"detail",
				kind:"Weather.Detail",
			}
		]},
		{name:"locatingPopup", kind:"onyx.Popup", centered:true, modal:true, floating:true, scrim:true, autoDismiss:false, scrimWhenModal:true, components:[
			{content:"Getting your current location"}
		]},
		{name:"getPlacePopup", kind:"onyx.Popup", centered:true, modal:true, floating:true, scrim:true, autoDismiss:false, scrimWhenModal:true, components:[
			{kind:"FittableRows", components:[
				{content:"Please enter your zip code"},
				{name:"gpsFailureReason", style:"color:#AAA"},
				{kind:"onyx.InputDecorator", alwaysLooksFocused:true, components:[
					{name:"placeInput", kind:"onyx.Input"}
				]},
				{kind:"onyx.Button", content:"Submit", classes:"onyx-dark", style:"display:block; width:100%;", ontap:"submitPlace"}
			]}
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

		enyo.dispatcher.listen(document, 'keyup', function(event) {
			if(event.keyCode == 27)
				enyo.Signals.send('onBackButton',event);
		});

		window.addEventListener('popstate',enyo.bind(this,'stateChanged'));
		window.INSTANCE = this;
	},

	submitPlace:function() {
		this.$.getPlacePopup.hide();
		var place = this.$.placeInput.getValue();
		this.$.outlook.setPlace(place);
		this.$.detail.setPlace(place);
	},

	rendered:function() {
		this.inherited(arguments);
		this.stateChanged();
		if (window.PalmSystem)
			PalmSystem.stageReady();

		this.$.locatingPopup.show();
		Weather.Geolocation.getLocation()
			.response(enyo.bind(this, function(sender,response) {
				this.$.locatingPopup.hide();
				this.$.outlook.setPlace(response);
				this.$.detail.setPlace(response);
			}))
			.error(enyo.bind(this, function(sender,error) {
				this.$.locatingPopup.hide();
				switch(error.code) {
					case error.PERMISSION_DENIED:
						this.$.gpsFailureReason.setContent("GPS permission denied");
						break;
					case error.POSITION_UNAVAILABLE:
						this.$.gpsFailureReason.setContent("GPS position unavailable");
						break;
					case error.TIMEOUT:
						this.$.gpsFailureReason.setContent("GPS timed out");
						break;
					default:
						this.$.gpsFailureReason.setContent("Unknown geolocation error");
				}
				this.$.getPlacePopup.show();
				this.$.placeInput.focus();
			}));
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
				this.showOverview();
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
			this.showOverview();
	},

	showOverview:function() {
		this.$.detail.setData(null);
		this.$.panels.setIndex(0);
	},

	showDetail:function(sender,event) {
		if(!this.$.panels.getIndex() && event.top) {
			enyo.job('slideUp', enyo.bind(this, function() {
					this.$.detailForecastAnimator.play({startValue:event.top, endValue:0});
				}), this.$.panels.getAnimator().getDuration());
			this.$.detail.$.today.applyStyle('position','relative');
			this.$.detail.$.today.setBounds({ top:event.top+"px"});
		}
		this.$.panels.setIndex(1);
		this.$.detail.setData(event.data);
	},

	animateDetailForecast:function(animator,event) {
		this.$.detail.$.today.setBounds({ top:animator.value+"px" });
	},

	repositionDetailForecast:function(animator,event) {
		this.$.detail.$.today.applyStyle('position','');
		this.$.detail.$.today.setBounds({
			top:"0",
			left:"0"
		});
	}
});
