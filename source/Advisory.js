enyo.kind({
	name:"Cumulus.Advisory",
	classes:"cumulus-advisory",
	published:{
		advisory:null
	},

	components:[
		{kind:"Scroller", classes:"enyo-fit", components:[
			{name:"name", tag:"h1"},
			{name:"timerange", tag:"h2"},
			{name:"place", classes:"place"},
			{name:"body", classes:"body", allowHtml:true}
		]}
	],

	advisoryChanged:function(old,advisory) {
		this.$.name.setContent(advisory.details.name);
		this.$.body.setContent(this.formatBody(advisory.details.body));
		this.$.place.setContent(advisory.place.name);
		this.$.timerange.setContent([
			this.formatDate(new Date(advisory.timestamps.beginsISO)),
			"to",
			this.formatDate(new Date(advisory.timestamps.expiresISO))
		].join(" "));
	},

	formatBody:function(body) {
		var paragraphs = body.split(/\n\n+/g);

		var formatParagraph = function(paragraph) {
			return paragraph.replace(/\n/g,' ')
				.split('. ')
				.map(function(sentence) {
					var notYelling = sentence.charAt(0) + (
						sentence.slice(1)
							.toLowerCase()
							.replace(/\.\.\./g,", ")
							.replace(/([^.])$/g,"$1.")
							.trim()
						);
					return "<span class=\"sentence\">"+notYelling+"</span>";
				}).join(' ');
		};

		return paragraphs.map(function(p) {
			return "<p>"+formatParagraph(p)+"</p>";
		}).join('');
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
