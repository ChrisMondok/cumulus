enyo.kind({
	name:"Cumulus.MinutelyForecast",
	classes:"minutely-forecast",

	published:{
		api:null,
		place:null,
		minutely:null,
		graphFillStyle:"rgba(35,91,134,0.5)",
		graphStrokeStyle:"rgba(35,91,134,1)",
		graphLineStyle:"rgba(0,0,0,0.5)",
		graphMinuteStyle:"rgba(0,0,0,1)"
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},

	_ctx:null,
	_graphUpperBound:0,
	_graphLineIncrement: 0.25,
	_gutterWidth:48,
	_oldData: null,

	components:[
		{name:"summary", content:$L("Hang on a second...")},
		{name:"graph", tag:"canvas", attributes:{height:"300px"}, style:"height:300px; width:100%;"},
		{name:"animator", kind:"Animator", onStep:"drawGraph", start:0, end:1},
		{name:"loadingOverlay", tag:"div", classes:"loading-overlay"}
	],

	getApiFromEvent:function(event) {
		this.setApi(event.api);
	},

	rendered:function() {
		if(this.$.graph.hasNode()) {
			this._ctx = this.$.graph.node.getContext('2d');
		}
	},

	refresh:function() {
		var api = this.getApi(),
			place = this.getPlace();

		if(api && place) {
			this.$.loadingOverlay.show();
			api.getMinutelyForecast(this.getPlace())
				.response(this,"gotMinutelyForecast")
				.response(this.$.loadingOverlay,this.$.loadingOverlay.hide);
		}
	},

	resizeHandler:function() {
		this.inherited(arguments);
		this.drawGraph();
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
		var data = this.getData(),
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
			data = this.getData(),
			animValue = this.$.animator.value;
			canAnimateData = this._oldData && this._oldData.data.length == data.length;

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

	gotMinutelyForecast:function(request, response) {
		this.setMinutely(response);
	},

	minutelyChanged:function(old, minutely) {
		this._oldData = old;
		this.$.summary.setContent(minutely ? minutely.summary : $L("Hang on a second..."));

		var data = this.getData();

		var maxPrecipIntensity = data.reduce(
			function(max,item){return Math.max(max,item.precipIntensity);},0
		);


		if(maxPrecipIntensity < 0.1)
			this._graphLineIncrement = 0.05;
		else if(maxPrecipIntensity < 0.25)
			this._graphLineIncrement = 0.1;
		else if(maxPrecipIntensity < 1)
			this._graphLineIncrement = 0.25;
		else
			this._graphLineIncrement = 1;

		this._graphUpperBound = Math.ceil(maxPrecipIntensity/this._graphLineIncrement)*this._graphLineIncrement;

		this.$.animator.play({duration:data && data.length ? 1000 : 1});

	},

	getData:function() {
		return (this.getMinutely() || {data:[]}).data;
	}
});
