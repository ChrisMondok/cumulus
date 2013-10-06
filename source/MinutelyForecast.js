enyo.kind({
	name:"Cumulus.MinutelyForecast",
	classes:"minutely-forecast",
	published:{
		api:null,
		place:null,
		minutely:null,
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},

	_ctx:null,
	_graphUpperBound:0,
	_gutterWidth:64,

	components:[
		{name:"summary", content:$L("Hang on a second...")},
		{name:"graph", tag:"canvas", attributes:{height:"480px"}, style:"height:480px; width:100%;"},
		{name:"animator", kind:"Animator", onStep:"drawGraph", start:0, end:1}
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

		if(api && place)
			api.getMinutelyForecast(this.getPlace()).response(this,"gotMinutelyForecast");
	},

	resizeHandler:function() {
		this.inherited(arguments);
		this.drawGraph();
	},

	drawGraphLines: function() {
		var ctx = this._ctx,
			bounds = this.$.graph.getBounds();

		ctx.strokeStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		for(var i = 0; i < this._graphUpperBound; i += 0.25)
		{
			ctx.moveTo(this._gutterWidth+(i/this._graphUpperBound)*(bounds.width-this._gutterWidth),0);
			ctx.lineTo(this._gutterWidth+(i/this._graphUpperBound)*(bounds.width-this._gutterWidth),bounds.height);
		}
		ctx.stroke();

		ctx.strokeStyle = "rgba(0,0,0,1)";
		ctx.beginPath();
		ctx.moveTo(this._gutterWidth,0);
		ctx.lineTo(this._gutterWidth,bounds.height);
		ctx.stroke();
	},

	drawMinutes:function() {
		var data = this.getData(),
			ctx = this._ctx,
			now = new Date(),
			bounds = this.$.graph.getBounds(),
			gutterWidth = this._gutterWidth;

		ctx.strokeStyle = ctx.fillStyle = "rgba(0,0,0,0.55)";
		ctx.textAlign = "end";
		ctx.textBaseline = "middle";
		ctx.font = "20px sans-serif";
		ctx.beginPath();
		data.forEach(function(item,index,array) {
			var diff = new Date(item.time) - now;
			var minutes = Math.floor(diff / 60000);
			if(!(minutes % 5)) {
				ctx.moveTo(gutterWidth,bounds.height*(index/array.length));
				ctx.lineTo(bounds.width,bounds.height*(index/array.length));
				ctx.fillText([minutes,$L("min")].join(' '),gutterWidth,bounds.height*(index/array.length));
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
			data = this.getData()

		ctx.clearRect(0,0,bounds.width,bounds.height);

		this.drawGraphLines();
		this.drawMinutes();
		
		ctx.strokeStyle = "rgba(132,167,193,1)";
		ctx.fillStyle = "rgba(132,167,193,0.5)";
		
		ctx.beginPath();
		data.forEach(function(item,index,array) {
			ctx[index?"lineTo":"moveTo"](
				this._gutterWidth + (item.precipIntensity/this._graphUpperBound)*(bounds.width-this._gutterWidth),
				bounds.height*index/(array.length-1)
			);
		}.bind(this));
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
		this.$.summary.setContent(minutely.summary);

		var data = this.getData();
		var maxPrecipIntensity = data.reduce(function(max,item){return Math.max(max,item.precipIntensity);},0);
		this._graphUpperBound = Math.ceil(maxPrecipIntensity/0.25)*0.25;

		this.drawGraph();
	},

	getData:function() {
		return (this.getMinutely() || {data:[]}).data;
	}
});
