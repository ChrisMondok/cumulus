var Simple = { };
Simple.rethrow = false;
(function(namespace) {
	function Test(name, fn) {
		this.name = name;
		this.fn = fn;
		this.passed = undefined;
		this.exception = null;
	}

	Test.prototype.run = function(scope) {
		if(scope)
			fn = this.fn.bind(scope);
		else
			fn = this.fn;

		try {
			this.passed = Boolean(fn());
		} catch (e) {
			this.passed = false;
			this.exception = e;
			if(Simple.rethrow)
				throw e;
		}
	}

	namespace.Test = Test;
})(Simple);
(function(namespace) {
	function Context(name, scope) {
		this.name = name;
		this.setup = null;
		this.teardown = null;
		this.tests = [];
		this.scope = scope || {};
	}

	Context.prototype.add = function() {
		for(var i = 0; i < arguments.length; i++)
		{
			var test = arguments[i];
			if(test instanceof Simple.Test)
				this.tests.push(test);
			else
				throw "argument (" + test + ") is not a test";
		}
	}

	Context.prototype.run = function() {
		for(var t in this.tests)
		{
			if(this.setup)
				this.setup.bind(this.scope)();
			this.tests[t].run(this.scope);
			if(this.teardown)
				this.teardown.bind(this.scope)();
		}
	}

	Context.prototype.getResults = function() {
		var results = {};

		for(var i = 0; i < this.tests.length; i++)
		{
			var test = this.tests[i];
			var result = undefined;
			if(test.passed === true)
				result = "passed";
			else
				if(test.passed === false)
					result = "failed"
				else
					result = test.passed;

			results[this.tests[i].name] = result;
		}

		return results;
	}

	namespace.Context = Context;
})(Simple);
