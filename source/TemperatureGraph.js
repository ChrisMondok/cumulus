enyo.kind({
	name:"Cumulus.TemperatureGraph",
	kind:"Graph",

	published:{
		step:10,
	},

	dataChanged:function() {
		var key = this.getKey(), step = this.getStep();
		var temps = (this.getData() || []).map(function(d){return d[key]});

		if(temps.length) {
			var min = temps.reduce(function(a,b){return Math.min(a,b)});
			var max = temps.reduce(function(a,b){return Math.max(a,b)});

			this.setMin(Math.floor((min-1)/step)*step);
			this.setMax(Math.ceil((max+1)/step)*step);
			this.setShowLabels(true);
			this.$.labels.reflow();
			this.resizeHandler();
		}

		else
			this.setShowLabels(false);

		this.inherited(arguments);
	},

	drawGraphLines:function() {
		this.inherited(arguments);

		var step = this.getStep();

		var bottom = Math.floor(this.getMin()/step)*step;
		var top = Math.ceil(this.getMax()/step)*step;

		var amount = this.$.animator.value;

		for(var i = bottom; i < top; i+=step) {
			var y = this.valueToY(i);
			this._ctx.beginPath();
			this._ctx.moveTo(0,this.valueToY(i));
			this._ctx.lineTo(this.$.canvas.getBounds().width * amount,this.valueToY(i));
			this._ctx.stroke();
			this._ctx.closePath();
		}

	}
});
