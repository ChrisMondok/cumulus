enyo.kind({
	name:"cumulus.TemperatureGraph",
	kind:"cumulus.Graph",

	published:{
		step:10
	},

	arrayOfValuesChanged:function(old, array) {
		this.inherited(arguments);
		this.calculateMinAndMax();
	},

	calculateMinAndMax: function() {
		var array = this.arrayOfValues;
		var step = this.getStep();

		this._oldMin = this.get('min');
		this._oldMax = this.get('max');

		if(array && array.length) {
			var min = array.reduce(function(a,b){return Math.min(a,b);});
			var max = array.reduce(function(a,b){return Math.max(a,b);});

			this.setMin(Math.floor((min-1)/step)*step);
			this.setMax(Math.ceil((max+1)/step)*step);
			this.setShowLabels(true);
			this.resizeHandler();
		}
		else
			this.setShowLabels(false);
	},

	drawGraphLines:function(animStep) {
		this.inherited(arguments);

		var step = this.getStep(),
			amount = animStep,
			min = this.get('min'),
			max = this.get('max');

		for(var i = this.min; i < this.max; i+=step) {
			var y = this.valueToY(i);
			this._ctx.beginPath();
			this._ctx.moveTo(0,this.valueToY(i));
			this._ctx.lineTo(this.$.canvas.getBounds().width * amount,this.valueToY(i));
			this._ctx.stroke();
			this._ctx.closePath();
		}

		if(min <= 32 && max >= 32)
		{
			this._ctx.strokeStyle = "#9999FF";
			this._ctx.beginPath();
			var f = this.valueToY(32);
			this._ctx.moveTo(0, f);
			this._ctx.lineTo(this.$.canvas.getBounds().width * amount, f);
			this._ctx.stroke();
			this._ctx.closePath();
		}

	}, 

	valueToY:function(value) {
		var step = this.animator ? this.animator.value : 1;
		var oldMin = isNaN(this._oldMin) ? this.min : this._oldMin;
		var oldMax = isNaN(this._oldMax) ? this.max : this._oldMax;

		var min = cumulus.Utils.lerp(oldMin, this.min, step);
		var max = cumulus.Utils.lerp(oldMax, this.max, step);

		return this.getBounds().height * (1 - (value-min)/(max-min));
	}
});
