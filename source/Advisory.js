enyo.kind({
	name:"Cumulus.Advisory",
	classes:"cumulus-advisory",
	kind:"Scroller",
	touch:true,
	horizontal:"hidden",
	published:{
		advisory:null
	},

	components:[
		{name:"name", tag:"h1"},
		{name:"timerange", tag:"h2"},
		{name:"body", fit:true, classes:"body"}
	],

	advisoryChanged:function(old,advisory) {
		this.$.name.setContent(advisory.title);
		//this.$.body.setContent(this.formatBody(advisory.description));
		//this.$.body.destroyComponents();

		var paragraphs = advisory.description.split(/\.\.\.\s|\s\.\.\./g).map(this.makeParagraph,this);

		paragraphs.forEach(function(paragraph) {
			this.$.body.createComponent(paragraph)
		}, this);

		this.$.body.render();

		this.$.timerange.setContent([
			this.formatDate(new Date(advisory.time)),
			"to",
			this.formatDate(new Date(advisory.expires))
		].join(" "));
	},

	makeParagraph:function(string) {
		var sentences = string.split(/\.\s/g).map(this.makeSentence,this);
		return {kind:"Control", components:sentences};
	},

	makeSentence:function(string) {
			var formatted = string
				.replace(/^\./,'')
				.replace(/\.\.\./g,", ")
				.replace(/([^.])$/g,"$1.")
				.replace(/`/g,'\'')
				.trim();

			var isBullet = string.indexOf('*') == 0;

			var classes, content;
			if(isBullet) {
				classes = "sentence bullet";
				content = "• "+formatted.charAt(2).toUpperCase() + formatted.slice(3).toLowerCase();
			}
			else {
				classes = "sentence";
				content = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
			}

			return {kind:"Control", classes:classes, content:content};
	},

	formatDate:function(date) {
		var day = Cumulus.Main.formatDay(date),
			time = Cumulus.Main.formatTime(date);

		if(day == $L("today"))
			return time;
		else
			return [day.charAt(0).toUpperCase() + day.slice(1),time].join(" ");
	}
});
