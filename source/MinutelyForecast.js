enyo.kind({
	name:"cumulus.MinutelyForecast",
	classes:"minutely-forecast",

	published:{
		forecast: null,
		graphFillStyle:"rgba(35,91,134,0.5)",
		graphStrokeStyle:"rgba(35,91,134,1)",
		graphLineStyle:"rgba(0,0,0,0.5)",
		graphMinuteStyle:"rgba(0,0,0,1)",
		_data: null
	},

	_ctx:null,
	_graphUpperBound:0,
	_graphLineIncrement: 0.25,
	_gutterWidth:48,
	_oldData: null,

	bindings:[
		{from: '.forecast.minutely', to: '.minutely'},
		{from: '.minutely.summary', to: '.$.summary.content'}
	],

	components:[
		{name:"summary", content:$L("Hang on a second...")},
		{name:"graph", tag:"canvas", attributes:{height:"300px"}, style:"height:300px; width:100%;"},
		{name:"animator", kind:"Animator", onStep:"drawGraph", start:0, end:1, value: 0, duration: 1000}
	],

	rendered:function() {
		if(this.$.graph.hasNode()) {
			this._ctx = this.$.graph.node.getContext('2d');
		}
	},
	
	resizeHandler:function() {
		this.inherited(arguments);
		this.drawGraph();
	},

	showingChangedHandler: function(sender, inEvent) {
		this.$.animator.play({start: 0, end: inEvent.showing ? 1 : 0});
	},

	drawGraphLines: function() {
		var ctx = this._ctx,
			bounds = this.$.graph.getBounds();

		ctx.strokeStyle = this.getGraphLineStyle();
		ctx.beginPath();
		for(var i = 0; i < this._graphUpperBound; i += this._graphLineIncrement) {
			ctx.moveTo(this._gutterWidth+(i/this._graphUpperBound)*(bounds.width-this._gutterWidth),0);
			ctx.lineTo(this._gutterWidth+(i/this._graphUpperBound)*(bounds.width-this._gutterWidth),bounds.height * this.$.animator.value);
		}
		ctx.stroke();

		ctx.fillStyle = this.getGraphLineStyle();
		ctx.textAlign = "end";
		ctx.textBaseline = "top";
		ctx.fillText([this._graphUpperBound,"in/hr"].join(' '),bounds.width-4,4);
	},

	drawMinutes:function() {
		var data = this.get('_data') || [],
			ctx = this._ctx,
			now = new Date(),
			bounds = this.$.graph.getBounds(),
			gutterWidth = this._gutterWidth,
			animValue = this.$.animator.value;

		ctx.fillStyle = ctx.strokeStyle = this.getGraphMinuteStyle();
		ctx.beginPath();
		ctx.moveTo(this._gutterWidth,0);
		ctx.lineTo(this._gutterWidth,bounds.height);
		ctx.stroke();

		ctx.textAlign = "end";
		ctx.textBaseline = "middle";
		ctx.font = "12px sans-serif";
		data.forEach(function(item,index,array) {
			var diff = new Date(item.time) - now;
			var minutes = Math.floor(diff / 60000);
			if(!(minutes % 5))
				ctx.fillText(minutes?[minutes,$L("min")].join(' '):$L("Now"),gutterWidth*(2-animValue),bounds.height*(index/array.length));
		});

		ctx.clearRect(gutterWidth,0,bounds.width-gutterWidth,bounds.height);
		ctx.strokeStyle = ctx.fillStyle = this.getGraphLineStyle();
		ctx.beginPath();
		data.forEach(function(item,index,array) {
			if(index/array.length > animValue)
				return;
			var diff = new Date(item.time) - now;
			var minutes = Math.floor(diff / 60000);
			if(!(minutes % 5)) {
				ctx.moveTo(gutterWidth,bounds.height*(index/array.length));
				ctx.lineTo(bounds.width,bounds.height*(index/array.length));
			}
		});
		ctx.stroke();
	},

	drawGraph:function() {
		this.sizeCanvas();
		if(!this._ctx)
			return;

		var ctx = this._ctx,
			bounds = this.$.graph.getBounds(),
			data = this.get('_data') || [],
			animValue = this.$.animator.value;
			canAnimateData = this._oldData && this._oldData.length == data.length;

		ctx.clearRect(0,0,bounds.width,bounds.height);

		this.drawMinutes();
		this.drawGraphLines();
		
		ctx.strokeStyle = this.getGraphStrokeStyle();
		ctx.fillStyle = this.getGraphFillStyle();
		
		ctx.beginPath();
		
		for(var i = 0; i < data.length; i++) {
			var intensity = animValue * data[i].precipIntensity + (1-animValue) * (canAnimateData ? this._oldData.data[i].precipIntensity : 0);

			ctx[i?"lineTo":"moveTo"](
				this._gutterWidth + (intensity/this._graphUpperBound)*(bounds.width-this._gutterWidth),
				bounds.height*i/(data.length-1)
			);
		}
		ctx.stroke();
		ctx.lineTo(this._gutterWidth,bounds.height);
		ctx.lineTo(this._gutterWidth,0);
		ctx.fill();

	},

	sizeCanvas:function() {
		this.$.graph.setAttribute("width",this.getBounds().width+"px");
	},

	minutelyChanged: function(old, minutely) {
		this.set('_oldData', this.get('_data'));
		if(minutely) {
			this.set('_data', minutely.raw());

			this.adjustGraphLines();
		}
	},

	adjustGraphLines: function() {
		var intensities = this.get('_data').map(function(x) {return x.precipIntensity;});
		var maxPrecipIntensity = intensities.length ? Math.max.apply(Math,intensities) : 0;

		if (maxPrecipIntensity < 0.5)
			this.set('_graphLineIncrement', 0.25);
		else if (maxPrecipIntensity < 1)
			this.set('_graphLineIncrement', 0.5);
		else
			this.set('_graphLineIncrement', 1);

		this.set('_graphUpperBound', Math.max(Math.ceil(maxPrecipIntensity/this._graphLineIncrement),2)*this._graphLineIncrement);
	}
});
