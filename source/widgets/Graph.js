enyo.kind({
	name: "cumulus.Graph",

	style: "",

	classes: "graph",

	published:{
		collection: null,
		sunrise: null,
		sunset: null,

		fillColors:["rgba(255,255,255,0.25)"],
		strokeColors:["rgba(255,255,255,1)"],
		graphColor: "rgba(0,0,0,0.25)",
		nightColor: "rgba(0,0,0,0.2)",
		keys: "",
		friendlyKeys: null,
		friendlyValueTransforms: null,
		min:0,
		max:100,
		nowColor: "#f79a42",

		showLabels:false
	},

	_ctx:null,

	_currentPosition: null,

	_selectedPct: null,
	_selectedIndex: 0,

	components:[
		{name: "max", style: "position:absolute; left:0px; top:0px;"},
		{name: "min", style: "position:absolute; left:0px; bottom:0px;"},
		{name: "canvas", style: "width:100%; height:100%", tag: "canvas", ondown: "graphTouched", ondrag:"graphTouched", onup:"closeDetail", onleave:"closeDetail"},
		{name: "animator", kind: "Animator", onStep: "drawGraph", easingFunction: enyo.easing.quadInOut, duration:750},
		{name: "detail", ontap: "_closeDetail", showing: false, classes: "graph-detail", components:[
			{name: "selectedTimeDisplay", tag: "time"},
			{name: "detailRepeater", tag: "dl", kind: "enyo.Repeater", onSetupItem: "setupDetailItem", components:[
				{tag: "dt", classes: "label", name: "label"},
				{tag: "dd", classes: "value", name: "value"}
			]}
		]}
	],

	bindings:[
		{from: ".showLabels", to: ".$.max.showing"},
		{from: ".showLabels", to: ".$.min.showing"},
		{from: ".collection", to: "._values", transform: function(collection) {
			var raw = collection ? collection.raw() : [];
			var keys = this.get("keys");
			return keys.map(function(k) {
				return raw.map(function(d) {return d[k];} );
			});
		}},
		{from: ".min", to: ".$.min.content"},
		{from: ".max", to: ".$.max.content"},
		{from: ".keys", to: ".$.detailRepeater.count", transform: function(keys) {
			return keys.length;
		}}
	],

	graphTouched: function(inSender, inEvent) {
		this.$.detail.show();
		this._selectedPct = Math.max(0, Math.min(1,
			(inEvent.clientX - this.getBounds().left) / this.getBounds().width
		));
		this.drawGraph();
		this.set('_selectedIndex', Math.round((this._values[0].length - 1)* this._selectedPct));
		this.stopJob('closeDetail');
	},

	closeDetail: function(inSender, inEvent) {
		if(this.$.detail.showing)
			this.startJob('closeDetail', '_closeDetail', 2000);
	},

	_closeDetail: function() {
		this.stopJob('closeDetail');
		this.$.detail.hide();
		this._selectedPct = null;
		this.drawGraph();
	},

	_selectedIndexChanged: function(old, x) {
		this.$.selectedTimeDisplay.setContent(this.get('collection').at(x).get('timeString'));
		this.$.detailRepeater.build();
	},

	setupDetailItem: function(inSender, inEvent) {
		var key = this.keys[inEvent.index];
		var friendlyKey = this.friendlyKeys && this.friendlyKeys[inEvent.index] || key;
		inEvent.item.$.label.setContent(friendlyKey);

		var value = this._values[inEvent.index][this._selectedIndex];
		var friendlyValue = this.friendlyValueTransforms && this.friendlyValueTransforms[inEvent.index] ? 
			this.friendlyValueTransforms[inEvent.index].call(this, value)
			: String(value);

		inEvent.item.$.value.setContent(friendlyValue);
	},

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

	drawValues:function(key) {
		var animStep = this.$.animator.value;	
		var values = this._values[key];
		var ctx = this._ctx;
		var bounds = this._canvasBounds;
		var fillColor = this.fillColors[key];
		var color = this.strokeColors[key];

		ctx.beginPath();

		for(var i = 0; i < values.length; i++)
			ctx.lineTo(this.getX(i),animStep*this.getY(key,i)+(1-animStep)*this.getOldY(key,i)); 
		
		if(color) {
			ctx.strokeStyle = color;
			ctx.stroke();
		}

		if(fillColor) {
			ctx.lineTo(bounds.width,bounds.height);
			ctx.lineTo(0,bounds.height);
			ctx.fillStyle = fillColor;
			ctx.fill();
		}
	},

	drawGraph:function() {
		if(!this._ctx)
			return;

		var ctx = this._ctx;
		var animStep = this.$.animator.value;

		ctx.clearRect(0,0,this._canvasBounds.width,this._canvasBounds.height);

		if(this.hasValues()) {
			this.drawBackground(animStep);
			if(this.numberOfValuesHasChanged())
				this.drawGraphLines(animStep);
			else
				this.drawGraphLines(1);

			for(var i = 0; i < this._values.length; i++)
				this.drawValues(i, !i);

			if(this._selectedPct !== null)
				this.drawSelectedPct();
			this.drawNow();
		}
	},

	drawSelectedPct: function() {
		var ctx = this._ctx;
		var bounds = this._canvasBounds;
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(this._selectedPct * bounds.width, 0);
		ctx.lineTo(this._selectedPct * bounds.width, bounds.height);
		ctx.stroke();
	},

	drawNow: function() {
		var ctx = this._ctx;
		var animStep = this.$.animator.value;
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
			var first = collection.at(0).get("time"),
				last = collection.at(collection.length - 1).get("time");

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
		var y = this.valueToY(this.get("_values")[key][i]);
		return y;
	},

	getOldY:function(key, i) {
		var array = this.get("_values")[key][i];

		if(this.numberOfValuesHasChanged())
			return this.valueToY(this.getMin());

		return this.valueToY(this._oldValues[key][i]);
	},

	valueToY:function(value) {
		var step = this.$.animator.value;

		return this._canvasBounds.height * (1 - (value-this.min)/(this.max-this.min));
	},

	_valuesChanged:function(old, values) {
		if(old)
			this._oldValues = old;
		else {
			this._oldValues = this.keys.map(function(k) {
				return [];
			});
		}

		this.calculateCurrentPosition();

		if(this.hasValues())
			this.$.animator.play();
	},

	showingChangedHandler: function(inSender, inEvent) {
		this.sizeCanvas();
		if(inEvent.showing && this.hasValues())
			this.$.animator.play();
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
		this._ctx = this.$.canvas.hasNode().getContext("2d");
		this.sizeCanvas();
	}
});
