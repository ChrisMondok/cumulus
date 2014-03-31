enyo.kind({
	name:"cumulus.Graph",

	style:"position:relative; height:4em;",

	published:{
		collection: null,
		sunrise: null,
		sunset: null,

		fillColor:"rgba(255,255,255,0.25)",
		strokeColor:"rgba(255,255,255,1)",
		graphColor:"rgba(0,0,0,0.25)",
		key:"",
		min:0,
		max:100,
		nowColor:"#f79a42",

		showLabels:false,

		animator:null
	},

	_ctx:null,

	_currentPosition: null,

	_oldCollection: null,

	components:[
		{name:"max", style:"position:absolute; left:0px; top:0px;"},
		{name:"min", style:"position:absolute; left:0px; bottom:0px;"},
		{name:"canvas", style:"width:100%; height:100%", tag:"canvas"}
	],

	bindings:[
		{from: '.showLabels', to: '.$.max.showing'},
		{from: '.showLabels', to: '.$.min.showing'},
		{from: '.collection', to: '.arrayOfValues', transform: function(collection) {
			if(collection) {
				var key = this.get('key');
				return collection.raw().map(function(d){return d[key];});
			}
			else
				return [];
		}},
		{from: '.min', to: '.$.min.content'},
		{from: '.max', to: '.$.max.content'}
	],

	drawGraph:function() {
		if(!this._ctx)
			return;

		var bounds = this.$.canvas.getBounds(),
			values = this.arrayOfValues,
			ctx = this._ctx,
			animStep = this.animator ? this.animator.value : 1;

		ctx.clearRect(0,0,bounds.width,bounds.height);

		if(values && values.length) {
			//draw grid
			this.drawBackground(animStep);
			if(this._oldArrayOfValues && this._oldArrayOfValues.length == values.length)
				this.drawGraphLines(1);
			else
				this.drawGraphLines(animStep);

			//draw graph
			ctx.fillStyle = this.fillColor;
			ctx.strokeStyle = this.strokeColor;
			ctx.beginPath();
			for(var i = 0; i < values.length; i++)
				ctx.lineTo(this.getX(i),animStep*this.getY(i)+(1-animStep)*this.getOldY(i)); 
			ctx.stroke();
			ctx.lineTo(bounds.width,bounds.height);
			ctx.lineTo(0,bounds.height);
			ctx.fill();

			//draw now
			if(this._currentPosition !== undefined) {
				var currentPercentage = this._currentPosition * bounds.width;
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
	},

	drawGraphLines:function(animValue) {
		this._ctx.strokeStyle = this.getGraphColor();
		var collection = this.getCollection();

		var amount = (collection.length-1) * animValue;

		for(var i = 0; i < amount; i++) {
			var x = this.getX(i);
			this._ctx.beginPath();
			this._ctx.moveTo(x,0);
			this._ctx.lineTo(x,this.getBounds().height);
			this._ctx.stroke();
			this._ctx.closePath();
		}
	},

	drawBackground: function() {

	},

	timeToX: function(time) {
		var collection = this.getCollection();
		var x = undefined;

		if(collection && collection.length) {
			var first = collection.at(0).get('time'),
				last = collection.at(collection.length - 1).get('time');

			x = (time - first) / (last - first);
		}

		return x;
	},

	calculateCurrentPosition: function() {
		var x = this.timeToX(new Date().getTime());
		if(x < 0 || x > 1)
			x = undefined;

		this._currentPosition = x;
	},
	
	getX:function(i) {
		return this.getBounds().width*(i/(this.get('arrayOfValues').length-1));
	},
	
	getY:function(i) {
		return this.valueToY(this.get('arrayOfValues')[i]);
	},

	getOldY:function(i) {
		var array = this.get('arrayOfValues');

		if(!this._oldArrayOfValues || array.length != this._oldArrayOfValues.length)
			return this.valueToY(this.getMin());

		return this.valueToY(this._oldArrayOfValues[i]);
	},

	valueToY:function(value) {
		var step = this.animator ? this.animator.value : 1;
		var oldMin = isNaN(this._oldMin) ? this.min : this._oldMin;
		var oldMax = isNaN(this._oldMax) ? this.max : this._oldMax;

		var min = cumulus.Utils.lerp(oldMin, this.min, step);
		var max = cumulus.Utils.lerp(oldMax, this.max, step);

		return this.getBounds().height * (1 - (value-min)/(max-min));
	},

	arrayOfValuesChanged:function(old, array) {
		this._oldArrayOfValues = old;
		this._oldMin = this.get('min');
		this._oldMax = this.get('max');

		this.calculateCurrentPosition();

		this.$.min.setContent(this.getMin());
		this.$.max.setContent(this.getMax());

		this.drawGraph();
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

});
