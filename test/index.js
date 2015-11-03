var inset = require('../index.js');
var assert = require('assert');

var testUrl = "http://dynamic-inset-assets.herokuapp.com/inset/inset.json";

describe('DynamicInset', function(){
		
		it('should fetch', function(done) {
			inset.render(testUrl, function(err, results){
  			if (err) throw err;
  			assert.equal(results.status,'OK');
  			done();
  		});
		});

});
