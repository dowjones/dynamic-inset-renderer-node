var inset = require('../index.js');
var assert = require('assert');

var testUrl = "http://dynamic-inset-assets.herokuapp.com/inset/inset.json";

describe('Fetch and render inset by url', function(){
	
	inset.render(testUrl, function(err, results){
	  assert.equal(err, null);

	});	

})
