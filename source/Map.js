enyo.kind({
	name:"Cumulus.Map",
	style:"position:relative",

	published:{
		api:null,
		place:null,
		nearbyObservations:null,
		fillStyle:"rgba(193,211,224,1)",
		strokeStyle:"rgba(132,167,193,1)",
		backgroundColor:"rgba(255,255,255,1)",
		textStyle:"rgba(0,0,0,1)",
		scale:1
	},

	statics:{
		lerp:function(v,a,b) { //expects two arrays
			var result = [];
			for(var i = 0; i < a.length; i++) {
				result[i] = a[i] * (1-v) + b[i] * (v)
			}

			return result
		}
	},

	handlers:{
		onApiCreated:"getApiFromEvent"
	},

	getApiFromEvent:function(event) {
		this.setApi(event.api);
	},

	_ctx:null,

	components:[
		{
			name:"canvas",
			tag:"canvas",
			style:"position:absolute; left:0px; top:0px; width:100%; height:100%; background-color:white"
		},
		{name:"animator", kind:"Animator", onStep:"draw", onEnd:"createLabels", duration:1000},
		{name:"placeRepeater", kind:"Repeater", onSetupItem:"setupPlace", components:[
			{name:"container", classes:"place-label", components:[
				{name:"icon", kind:"Image"},
				{components:[
					{name:"id"},
					{name:"temperature"}
				]},
			]}
		]},
	],

	apiChanged:function() {
		if(this.getPlace())
			this.refresh();
	},

	placeChanged:function() {
		if(this.getApi())
			this.refresh();
	},

	rendered:function() {
		this.inherited(arguments);
		this.sizeCanvas();
		this._ctx = this.$.canvas.hasNode().getContext('2d');
	},

	resizeHandler:function() {
		this.inherited(arguments);
		this.draw();

		this.sizeCanvas();
	},

	sizeCanvas:function() {
		console.log("Size canvas");
		var bounds = this.$.canvas.getBounds();
		this.$.canvas.setAttribute('height',bounds.height);
		this.$.canvas.setAttribute('width',bounds.width);
	},

	draw:function() {
		var ctx = this._ctx;
		if(!ctx)
			return;

		var bounds = this.$.canvas.getBounds(),
			animator = this.$.animator;

		ctx.clearRect(0,0,bounds.width,bounds.height);

		ctx.strokeStyle = this.getStrokeStyle();
		ctx.fillStyle = this.getFillStyle();

		ctx.beginPath();
		ctx.arc(bounds.width/2,bounds.height/2,8,0,2*Math.PI,false);
		ctx.stroke();
		ctx.fill();

		var nearby = this.getNearbyObservations(), here = this.getPlace();
		for(var i in nearby){
			var n = nearby[i],
				coords = this.getCoords(n);

			ctx.fillStyle = this.getFillStyle();

			ctx.beginPath();
			ctx.moveTo(bounds.width/2,bounds.height/2);
			ctx.lineTo.apply(ctx,Cumulus.Map.lerp(animator.value,[bounds.width/2,bounds.height/2],coords));
			ctx.stroke();
			ctx.closePath()

			ctx.beginPath();
			ctx.arc(coords[0],coords[1],4, 0, 2*Math.PI, false)
			ctx.stroke();
			ctx.fill();

			//ctx.fillStyle = this.getTextStyle();
			//ctx.fillText(n.id,x,y);
		}
	},

	getCoords:function(place) {
		var bounds = this.getBounds(), here = this.getPlace(), scale = this.getScale();

		x = bounds.width/2 + scale*(place.loc.long - here.longitude),
		y = bounds.height/2 + scale*(here.latitude - place.loc.lat)
		return [x,y];
	},

	refresh:function() {
		this.getApi().getAsync('nearbyObservations',this.getPlace())
			.response(enyo.bind(this,"gotNearbyObservations"));
	},

	gotNearbyObservations:function(ajax,response) {
		this.setNearbyObservations(response.response);
	},

	updateScale:function() {
		var maxX = 0, maxY = 0;
		var here = this.getPlace();
		this.getNearbyObservations().map(function(o) {
			maxX = Math.max(maxX, Math.abs(here.longitude - o.loc.long));
			maxY = Math.max(maxY, Math.abs(here.latitude - o.loc.lat));
		});

		var bounds = this.$.canvas.getBounds();
		this.setScale(Math.min(
			(bounds.width-128) / (2*maxX),
			(bounds.height-128) / (2*maxY)
		));
	},

	nearbyObservationsChanged:function() {
		if(this.getShowing()) {
			this.updateScale();
			this.$.animator.play({start:0, end:1});
		}
	},
	
	showingChanged:function() {
		this.inherited(arguments);

		if(this.getShowing() && this.getNearbyObservations()) {
			this.updateScale();
			this.$.animator.play({start:0, end:1});
		}
		else
			this.$.placeRepeater.setCount(0);
	},

	setupPlace:function(sender,event) {
		var place = this.getNearbyObservations()[event.index],
			coords = this.getCoords(place),
			item = event.item;
		
		if(!window.ITEMS)
			window.ITEMS = [];

		window.ITEMS[event.index] = item;

		item.$.id.setContent(place.id);
		item.$.temperature.setContent(place.ob.tempF+"°F");

		item.$.icon.setSrc("assets/weathericons/"+place.ob.icon);

		item.$.container.applyStyle("left",(coords[0]+6)+"px");
		item.$.container.applyStyle("top",(coords[1]+6)+"px");

		return true;
	},

	createLabels:function() {
		var nearbyObservations = this.getNearbyObservations() || [];

		this.$.placeRepeater.setCount(nearbyObservations.length);
	}
});
