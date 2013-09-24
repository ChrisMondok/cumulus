enyo.kind({
	name:"Cumulus.Cache",

	published:{
		source:null,
		cache:null,
		cacheName:'cache'
	},
	
	create:function() {
		this.inherited(arguments);
		this.setCache({});

		this.load();
	},

	dump:function() {
		this.setCache({});
		localStorage.removeItem(this.getCacheName());
	},

	load:function() {
		var loaded = localStorage.getItem(this.getCacheName());
		if(loaded)
		{
			this.setCache(JSON.parse(loaded));
		}
	},
	
	save:function() {
		localStorage.setItem(this.getCacheName(),JSON.stringify(this.getCache()));
	},

	ensureTracking:function(property) { // (property, arguments...)
		var cache = this.getCache();

		if(!cache[property])
			cache[property] = {};

		var args = JSON.stringify(this.stripFirstArgument.apply(this,arguments));

		if(!cache[property][args])
			cache[property][args] = {lastUpdated:0, value:undefined}
	},

	stopTracking:function(property,stringargs) { //(property, arguments...)
		console.groupCollapsed("Removing item from cache");
		console.info("Property",property);
		console.info("Arguments",stringargs);

		var cache = this.getCache();

		if(cache[property])
		{

			if(cache[property][stringargs])
			{
				delete cache[property][stringargs];
				console.info("Deleted");
				this.startJob('save','save',1000);
			}
			else
				console.info("argument mismatch");
		}
		else
			console.warn("Not cached!");
		console.groupEnd();
	},

	isOutdated:function(property) { // (property, arguments...)
		var args = JSON.stringify(this.stripFirstArgument.apply(this,arguments));
		return this.getCache()[property][args].lastUpdated == 0;
	},

	getFromCache:function(property) { // (property, arguments...)
		var args = JSON.stringify(this.stripFirstArgument.apply(this,arguments));
		return this.getCache()[property][args].value
	},

	getAsync:function(property) { // (property, arguments...)
		this.ensureTracking.apply(this,arguments);

		if(this.isOutdated.apply(this,arguments)) {
			console.log("Updating "+property);
			return this.update.apply(this,arguments);
		}
		else {
			console.log("Fetching "+property+" from cache.");
			return new enyo.Async().go(this.getFromCache.apply(this,arguments));
		}
	},

	generateGetter:function(property) {
		this[this.getNameOfGetter(property)] = this.getAsync.bind(this,property);
	},

	update:function(property) {
		var source = this.getSource();
		var cache = this.getCache();
		var self = this;

		var async = new enyo.Async();

		var args = this.stripFirstArgument.apply(this,arguments);
		var stringargs = JSON.stringify(args);
		
		var getter = source[this.getNameOfGetter(property)];
		getter.apply(source,args)
			.response(function(ajax,value) {
				cache[property][stringargs].value = value;
				cache[property][stringargs].lastUpdated = new Date();
				self.startJob('save','save',1000);
				async.go(value).error(function() {
					self.stopTracking(property,stringargs);
				});
			})
			.error(function(ajax,error) {
				self.stopTracking(property,stringargs);
			});

		return async;
	},

	getNameOfGetter:function(property) {
		return 'get'+property[0].toUpperCase()+property.slice(1)
	},

	stripFirstArgument:function() {
		var args = [];
		for(var i = 1; i < arguments.length; i++)
			args[i-1] = arguments[i];
		return args;
	}

});
