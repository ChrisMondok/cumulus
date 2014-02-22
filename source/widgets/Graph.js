enyo.kind({
	name:"Cumulus.Graph",

	style:"position:relative; height:4em;",

	published:{
		collection: null,
		fillColor:"rgba(255,255,255,0.25)",
		strokeColor:"rgba(255,255,255,1)",
		graphColor:"rgba(0,0,0,0.25)",
		key:"",
		min:0,
		max:100,
		nowColor:"#f79a42",

		showLabels:false,

		currentPosition:undefined,

		animator:null
	},

	_ctx:null,

	_oldCollection: null,

	components:[
		{name:"max", style:"position:absolute; left:0px; top:0px;"},
		{name:"min", style:"position:absolute; left:0px; bottom:0px;"},
		{name:"canvas", style:"width:100%; height:100%", tag:"canvas"}
	],

	create:function() {
		this.inherited(arguments);
		this.showLabelsChanged();
		this.setCollection(this.getCollection() || null);
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

	calculateCurrentPosition: function() {
		var x = undefined,
			collection = this.getCollection();

		if(collection && collection.length) {
			var now = new Date().getTime(),
				first = collection.at(0).get('time'),
				last = collection.at(collection.length - 1).get('time');

			var x = (now - first) / (last - first);
			if(x < 0 || x > 1)
				x = undefined;
		}

		this.setCurrentPosition(x);
	},
	
	collectionChanged:function(old, collection) {
		this._oldCollection = old;

		this.calculateCurrentPosition();

		this.$.min.setContent(this.getMin());
		this.$.max.setContent(this.getMax());

		this.drawGraph();
	},

	getX:function(i) {
		return this.getBounds().width*(i/(this.getCollection().length-1));
	},
	
	getY:function(i) {
		return this.valueToY(this.getCollection().at(i).attributes[this.key]);
		//return this.valueToY(this.getCollection().at(i).get(this.getKey()));
	},

	getOldY:function(i) {
		var collection = this.getCollection();

		if(!this._oldCollection || collection.length != this._oldCollection.length)
			return this.valueToY(this.getMin());

		return this.valueToY(this._oldCollection.at(i).attributes[this.key]);
		//return this.valueToY(this._oldCollection.at(i).get(this.getKey()));
	},

	valueToY:function(value) {
		var min = this.getMin(), max = this.getMax();
		return this.getBounds().height * (1 - (value-min)/(max-min));
	},

	perfTest: function() {
		var runs = 10000;
		var t;

		console.time('getters');
		for(var i = 0; i < runs; i++)
			for(var c = 0; c < this.collection.length; c++)
				t = this.collection.at(c).get('time');
		console.timeEnd('getters');

		console.time('hybrid');
		for(var i = 0; i < runs; i++)
			for(var c = 0; c < this.collection.length; c++)
				t = this.collection.at(c).attributes.time;
		console.timeEnd('hybrid');

		console.time('direct');
		for(var i = 0; i < runs; i++)
			for(var c = 0; c < this.collection.length; c++)
				t = this.collection.records[c].attributes.time;
		console.timeEnd('direct');
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

	drawGraph:function() {
		if(!this._ctx)
			return;

		var bounds = this.$.canvas.getBounds(),
			collection = this.collection,
			ctx = this._ctx,
			animStep = this.animator ? this.animator.value : 1;

		ctx.clearRect(0,0,bounds.width,bounds.height);

		if(collection && collection.length) {
			//draw grid
			if(this._oldCollection && this._oldCollection.length == collection.length)
				this.drawGraphLines(1);
			else
				this.drawGraphLines(animStep);

			//draw graph
			ctx.fillStyle = this.fillColor;
			ctx.strokeStyle = this.strokeColor;
			ctx.beginPath();
			for(var i = 0; i < collection.length; i++)
				ctx.lineTo(this.getX(i),animStep*this.getY(i)+(1-animStep)*this.getOldY(i)); 
			ctx.stroke();
			ctx.lineTo(bounds.width,bounds.height);
			ctx.lineTo(0,bounds.height);
			ctx.fill();

			//draw now
			if(this.currentPosition !== undefined) {
				var currentPercentage = this.currentPosition * bounds.width;
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
