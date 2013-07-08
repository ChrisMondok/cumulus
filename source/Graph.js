enyo.kind({
	name:"Weather.Graph",

	style:"position:relative; height:4em;",

	published:{
		data:null,
		fillColor:"rgba(255,255,255,0.25)",
		strokeColor:"rgba(255,255,255,1)",
		graphColor:"rgba(0,0,0,0.25)",
		key:"pop",
		min:0,
		max:100,

		showLabels:false,
	},

	_ctx:null,

	components:[
		{name:"labels", kind:"FittableRows", style:"position:absolute; left:0px; top:0px; height:100%", components:[
			{name:"max"},
			{fit:true},
			{name:"min"}
		]},
		{name:"canvas", style:"width:100%; height:100%", tag:"canvas"}
	],

	create:function() {
		this.inherited(arguments);
		this.showLabelsChanged();
	},

	showLabelsChanged:function() {
		var show = this.getShowLabels()

		this.$.labels.setShowing(show);

		if(show)
			this.$.labels.reflow();
	},

	resizeHandler:function() {
		this.inherited(arguments);
		this.drawGraph();
	},

	sizeCanvas:function() {
		var canvas = this.$.canvas;
		var bounds = canvas.getBounds();

		canvas.setAttribute("height",bounds.height+"px");
		canvas.setAttribute("width",bounds.width+"px");
	},

	rendered:function() {
		this.inherited(arguments);
		this._ctx = this.$.canvas.hasNode().getContext('2d');
	},

	dataChanged:function() {
		this.drawGraph();
	},

	getX:function(i) {
		return this.getBounds().width*(i/(this.getData().length-1));
	},
	
	getY:function(i) {
		return this.valueToY(this.getData()[i][this.getKey()]);
	},

	valueToY:function(value) {
		var min = this.getMin(), max = this.getMax();
		return this.getBounds().height * (1 - (value-min)/(max-min));
	},

	drawGraphLines:function() {
		this._ctx.strokeStyle = this.getGraphColor();
		var data = this.getData();

		for(var i = 0; i < data.length-1; i++) {
			var x = this.getX(i);
			this._ctx.beginPath();
			this._ctx.moveTo(x,0);
			this._ctx.lineTo(x,this.getBounds().height);
			this._ctx.stroke();
			this._ctx.closePath();
		}
	},

	drawGraph:function() {
		if(!this._ctx)
			return;

		this.sizeCanvas();

		var bounds = this.$.canvas.getBounds(), data = this.getData(), ctx = this._ctx;
		ctx.clearRect(0,0,bounds.width,bounds.height);


		if(data && data.length) {
			//draw grid
			this.drawGraphLines();

			//draw graph
			ctx.fillStyle = this.getFillColor();
			ctx.strokeStyle = this.getStrokeColor();
			ctx.beginPath();
			for(var i in data) {
				ctx.lineTo(this.getX(i),this.getY(i)); 
			}
			ctx.stroke();
			ctx.lineTo(bounds.width,bounds.height);
			ctx.lineTo(0,bounds.height);
			ctx.fill();
		}

		this.$.min.setContent(this.getMin());
		this.$.max.setContent(this.getMax());
	}
});
