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
		nightColor:"rgba(0,0,0,0.2)",
		key:"",
		min:0,
		max:100,
		nowColor:"#f79a42",

		showLabels:false,

		animator:null
	},

	_ctx:null,

	_currentPosition: null,

	components:[
		{name:"max", style:"position:absolute; left:0px; top:0px;"},
		{name:"min", style:"position:absolute; left:0px; bottom:0px;"},
		{name:"canvas", style:"width:100%; height:100%", tag:"canvas"}
	],

	bindings:[
		{from: '.showLabels', to: '.$.max.showing'},
		{from: '.showLabels', to: '.$.min.showing'},
		{from: '.collection', to: '._values', transform: function(collection) {
			var raw = collection ? collection.raw() : [];
			var keys = this.get('keys');
			return keys.map(function(k) {
				return raw.map(function(d) {return d[k];} );
			});
		}},
		{from: '.min', to: '.$.min.content'},
		{from: '.max', to: '.$.max.content'}
	],

	hasValues: function() {
		return this.keys && this._values && Boolean(this._values[0].length);
	},

	hasOldValues: function() {
		return this.keys && this._oldValues && Boolean(this._oldValues[0].length);
	},

	numberOfValuesHasChanged: function() {
		if(typeof(this._oldValues) != typeof(this._values))
			return true;
		return this._values[0].length != this._oldValues[0].length;
	},

	getAnimStep: function() {
		return this.animator ? this.animator.value : 1;
	},

	drawValues:function(key) {
		var animStep = this.getAnimStep();	
		var values = this._values[key];
		var ctx = this._ctx;
		var bounds = this._canvasBounds;

		ctx.fillStyle = this.fillColor;
		ctx.strokeStyle = this.strokeColor;
		ctx.beginPath();
		for(var i = 0; i < values.length; i++)
			ctx.lineTo(this.getX(i),animStep*this.getY(key,i)+(1-animStep)*this.getOldY(key,i)); 
		ctx.stroke();
		ctx.lineTo(bounds.width,bounds.height);
		ctx.lineTo(0,bounds.height);
		ctx.fill();
	},

	drawGraph:function() {
		if(!this._ctx)
			return;

		var ctx = this._ctx;
		var animStep = this.getAnimStep();

		ctx.clearRect(0,0,this._canvasBounds.width,this._canvasBounds.height);

		if(this.hasValues()) {
			this.drawBackground(animStep);
			if(this.numberOfValuesHasChanged())
				this.drawGraphLines(animStep);
			else
				this.drawGraphLines(1);

			this.drawValues(0);

			this.drawNow();
		}
	},

	drawNow: function() {
		var ctx = this._ctx;
		var animStep = this.getAnimStep();
		var bounds = this._canvasBounds;

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
	},

	drawGraphLines:function(animValue) {
		this._ctx.strokeStyle = this.getGraphColor();
		var collection = this.getCollection();

		var amount = (collection.length-1) * animValue;

		for(var i = 0; i < amount; i++) {
			var x = this.getX(i);
			this._ctx.beginPath();
			this._ctx.moveTo(x,0);
			this._ctx.lineTo(x,this._canvasBounds.height);
			this._ctx.stroke();
			this._ctx.closePath();
		}
	},

	drawBackground: function() {
		if(this.sunriseTime && this.sunsetTime) {
			var sunriseX = this.timeToX(this.sunriseTime) * this._canvasBounds.width;
			var sunsetX = this.timeToX(this.sunsetTime) * this._canvasBounds.width;

			this._ctx.fillStyle = this.nightColor;
			this._ctx.beginPath();
			this._ctx.moveTo(0, 0);
			this._ctx.lineTo(sunriseX, 0);
			this._ctx.lineTo(sunriseX, this._canvasBounds.height);
			this._ctx.lineTo(0, this._canvasBounds.height);
			this._ctx.closePath();
			this._ctx.fill();

			this._ctx.fillStyle = this.nightColor;
			this._ctx.beginPath();
			this._ctx.moveTo(this._canvasBounds.width, 0);
			this._ctx.lineTo(sunsetX, 0);
			this._ctx.lineTo(sunsetX, this._canvasBounds.height);
			this._ctx.lineTo(this._canvasBounds.width, this._canvasBounds.height);
			this._ctx.closePath();
			this._ctx.fill();
		}
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
		return this._canvasBounds.width*(i/(this._values[0].length-1));
	},
	
	getY:function(key, i) {
		var y = this.valueToY(this.get('_values')[key][i]);
		return y;
	},

	getOldY:function(key, i) {
		var array = this.get('_values')[key][i];

		if(this.numberOfValuesHasChanged())
			return this.valueToY(this.getMin());

		return this.valueToY(this._oldValues[key][i]);
	},

	valueToY:function(value) {
		var step = this.animator ? this.animator.value : 1;

		return this._canvasBounds.height * (1 - (value-this.min)/(this.max-this.min));
	},

	_valuesChanged:function(old, array) {
		if(old)
			this._oldValues = old;
		else {
			this._oldValues = this.keys.map(function(k) {
				return [];
			});
		}

		this.calculateCurrentPosition();

		this.drawGraph();
	},

	resizeHandler:function() {
		this.inherited(arguments);
		this.sizeCanvas();
		this.drawGraph();
	},

	sizeCanvas:function() {
		var canvas = this.$.canvas;
		var bounds = this._canvasBounds = canvas.getBounds();

		canvas.setAttribute("height",bounds.height);
		canvas.setAttribute("width",bounds.width);
	},

	rendered:function() {
		this.inherited(arguments);
		this._ctx = this.$.canvas.hasNode().getContext('2d');
		this.sizeCanvas();
	},

});
