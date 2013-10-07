enyo.kind({
	name:"Graph",

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

		currentPosition:undefined
	},

	events:{
		onAnimationFinished:""
	},

	_ctx:null,

	_oldData: null,

	components:[
		{name:"labels", kind:"FittableRows", style:"position:absolute; left:0px; top:0px; height:100%", components:[
			{name:"max"},
			{fit:true},
			{name:"min"}
		]},
		{name:"canvas", style:"width:100%; height:100%", tag:"canvas"},
		{name:"animator", kind:"Animator", onStep:"drawGraph", onEnd:"doAnimationFinished", start:0, end:1}
	],

	create:function() {
		this.inherited(arguments);
		this.showLabelsChanged();
		this.setData(this.getData() || null);
	},

	showLabelsChanged:function() {
		var show = this.getShowLabels();

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
	
	dataChanged:function(old, data) {
		this._oldData = old;

		if(this.getShowNow() && data && data.length) {
			var first = new Date(data[0].time),
				last = new Date(data[data.length - 1].time);

			this.setCurrentPosition((new Date() - first) / (last - first));
		}
		else
			this.setCurrentPosition(undefined);
		this.$.animator.play({duration:data && data.length ? 500 : 1});
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
			a = this.$.animator.value;

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
			data = this.getData(),
			ctx = this._ctx,
			animStep = Math.max(0,this.$.animator.value*2-1),
			currentPercentage = this.getCurrentPosition() * bounds.width;

		this.sizeCanvas();

		ctx.clearRect(0,0,bounds.width,bounds.height);

		if(data && data.length) {
			//draw grid
			if(this._oldData && this._oldData.length == data.length)
				this.drawGraphLines(1);
			else
				this.drawGraphLines(animStep);

			//draw graph
			ctx.fillStyle = this.getFillColor();
			ctx.strokeStyle = this.getStrokeColor();
			ctx.beginPath();
			for(var i in data) {
				ctx.lineTo(this.getX(i),animStep*this.getY(i)+(1-animStep)*this.getOldY(i)); 
			}
			ctx.stroke();
			ctx.lineTo(bounds.width,bounds.height);
			ctx.lineTo(0,bounds.height);
			ctx.fill();

			//draw now
			if(currentPercentage !== undefined) {
				var v = this.$.animator.value;
				ctx.strokeStyle = this.getNowColor();
				ctx.fillStyle = this.getNowColor();
				ctx.beginPath();
				ctx.moveTo(currentPercentage, 5);
				ctx.lineTo(currentPercentage+5, 0);
				ctx.lineTo(currentPercentage-5, 0);
				ctx.lineTo(currentPercentage, 5);

				ctx.lineTo(currentPercentage, (bounds.height - 5)*v);
				ctx.lineTo(currentPercentage - 5, (bounds.height - 5)*v+5);
				ctx.lineTo(currentPercentage + 5, (bounds.height - 5)*v+5);
				ctx.lineTo(currentPercentage, (bounds.height - 5)*v);
				ctx.fill();
				ctx.stroke();

				//ctx.moveTo(currentPercentage,0);
				//ctx.lineTo(currentPercentage,bounds.height);
				//ctx.stroke();

			}
		}

		this.$.min.setContent(this.getMin());
		this.$.max.setContent(this.getMax());
	}
});
