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
			{name:"body", classes:"body", allowHtml:true}
		]}
	],

	advisoryChanged:function(old,advisory) {
		this.$.name.setContent(advisory.title);
		this.$.body.setContent(this.formatBody(advisory.description));
		this.$.timerange.setContent([
			this.formatDate(new Date(advisory.time * 1000)),
			"to",
			this.formatDate(new Date(advisory.expires * 1000))
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
