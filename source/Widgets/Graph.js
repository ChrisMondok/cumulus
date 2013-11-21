enyo.kind({
	name:"Cumulus.Graph",

	style:"position:relative; height:4em;",

	published:{
		data:null,
		fillColor:"rgba(255,255,255,0.25)",
		strokeColor:"rgba(255,255,255,1)",
		graphColor:"rgba(0,0,0,0.25)",
		key:"",
		min:0,
		max:100,
		nowColor:"#f79a42",

		showLabels:false,
		showNow:true,

		currentPosition:undefined,

		animator:null
	},

	_ctx:null,

	_oldData: null,

	components:[
		{name:"max", style:"position:absolute; left:0px; top:0px;"},
		{name:"min", style:"position:absolute; left:0px; bottom:0px;"},
		{name:"canvas", style:"width:100%; height:100%", tag:"canvas"}
	],

	create:function() {
		this.inherited(arguments);
		this.showLabelsChanged();
		this.setData(this.getData() || null);
	},

	showLabelsChanged:function(wasShowing, show) {
		this.$.max.setShowing(show);
		this.$.min.setShowing(show);
	},

	resizeHandler:function() {
		this.inherited(arguments);
		this.sizeCanvas();
		this.drawGraph();
	},

	sizeCanvas:function() {
		var canvas = this.$.canvas;
		var bounds = canvas.getBounds();

		canvas.setAttribute("height",bounds.height);
		canvas.setAttribute("width",bounds.width);
	},

	rendered:function() {
		this.inherited(arguments);
		this._ctx = this.$.canvas.hasNode().getContext('2d');
		this.sizeCanvas();
	},
	
	dataChanged:function(old, data) {
		this._oldData = old;

		if(this.getShowNow() && data && data.length) {
			var first = new Date(data[0].time),
				last = new Date(data[data.length - 1].time);

			this.setCurrentPosition((new Date() - first) / (last - first));
		}
		else
			this.setCurrentPosition(undefined);

		this.$.min.setContent(this.getMin());
		this.$.max.setContent(this.getMax());

		this.drawGraph();
	},

	getX:function(i) {
		return this.getBounds().width*(i/(this.getData().length-1));
	},
	
	getY:function(i) {
		return this.valueToY(this.getData()[i][this.getKey()]);
	},

	getOldY:function(i) {
		var data = this.getData(),
			oldData = this._oldData || [],
			key = this.getKey();

		if(data.length != oldData.length)
			return this.valueToY(this.getMin());
		return this.valueToY(oldData[i][key]);
	},

	valueToY:function(value) {
		var min = this.getMin(), max = this.getMax();
		return this.getBounds().height * (1 - (value-min)/(max-min));
	},

	drawGraphLines:function(animValue) {
		this._ctx.strokeStyle = this.getGraphColor();
		var data = this.getData();

		var amount = (data.length-1) * animValue;

		for(var i = 0; i < amount; i++) {
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

		var bounds = this.$.canvas.getBounds(),
			data = this.data,
			ctx = this._ctx,
			animStep = this.animator ? this.animator.value : 1,
			currentPercentage = this.currentPosition * bounds.width;

		ctx.clearRect(0,0,bounds.width,bounds.height);

		if(data && data.length) {
			//draw grid
			if(this._oldData && this._oldData.length == data.length)
				this.drawGraphLines(1);
			else
				this.drawGraphLines(animStep);

			//draw graph
			ctx.fillStyle = this.fillColor;
			ctx.strokeStyle = this.strokeColor;
			ctx.beginPath();
			for(var i in data)
				ctx.lineTo(this.getX(i),animStep*this.getY(i)+(1-animStep)*this.getOldY(i)); 
			ctx.stroke();
			ctx.lineTo(bounds.width,bounds.height);
			ctx.lineTo(0,bounds.height);
			ctx.fill();

			//draw now
			if(currentPercentage !== undefined) {
				ctx.strokeStyle = this.getNowColor();
				ctx.fillStyle = this.getNowColor();
				ctx.beginPath();
				ctx.moveTo(currentPercentage, 5);
				ctx.lineTo(currentPercentage+5, 0);
				ctx.lineTo(currentPercentage-5, 0);
				ctx.lineTo(currentPercentage, 5);

				ctx.lineTo(currentPercentage, (bounds.height - 5)*animStep);
				ctx.lineTo(currentPercentage - 5, (bounds.height - 5)*animStep+5);
				ctx.lineTo(currentPercentage + 5, (bounds.height - 5)*animStep+5);
				ctx.lineTo(currentPercentage, (bounds.height - 5)*animStep);
				ctx.fill();
				ctx.stroke();
			}
		}

	}
});
