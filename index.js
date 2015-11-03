var request = require('request')
  , async = require('async')
  , hogan = require('hogan.js')
  , validator = require('validator');

/***
  The inset object is what is exported from this module.

  The usual usage for
  this module uses only the render function, which calls get_inset, then
  get_inset_data and get_inset_template in parallel, compiles the result and
  passes the rendered result to the callback.

  Example:
  inset.render("http://dynamic-inset-assets.herokuapp.com/inset/inset.json", function(err, results){
    console.log(results.compiled_inset);
  });

  Individual methods can be overwritten as well, for example to swap out the
  rendering method.

***/
var inset = {
  url:null,
  get_inset:function(callback){
    request({
      url: inset.url,
      json: true
    }, function(err, response, data){
      callback(err, data);
    });
  },
  get_inset_data:function(callback, results){

    if(results.inset_file.serverside.data.data != undefined){
      callback(null, results.inset_file.serverside.data.data);
    } else {
      request({url: results.inset_file.serverside.data.url, json:true}, function(err, response, data){
        callback(err, data);
      });
    }
  },
  get_inset_template:function(callback, results){
    if(results.inset_file.serverside.template.template != undefined){
      callback(null, results.inset_file.serverside.template.template);
    } else {
      request(results.inset_file.serverside.template.url, function(err, response, body){
        callback(err, body);
      });
    }
  },
  compile:function(callback, results){

    // inset data for clientside
    if ( typeof(results.inset_data['includeData']) == "string" || typeof(results.inset_data['includeData']) == "boolean" ) {
      var insetHashFuncName = getRandom();
      var insetDataScript = "<script>var " + insetHashFuncName + " = function() {return " + JSON.stringify(results.inset_data) + ";}</script>";
      results.inset_template = insetDataScript + results.inset_template; // prepend insetData_ function to template.
      results.inset_data['insetData'] = insetHashFuncName; // add to data object
    }

    callback(null, hogan.compile(results.inset_template).render(results.inset_data));
  },

  render:function(url, callback){
    if((typeof url === 'function') && (callback === undefined)) {
      callback = url;
      url = inset.url;
    } else {
      inset.url = url;
    }
    async.auto({
      inset_file:function(callback){
        if(validator.isJSON(url)) {
          callback(null, JSON.parse(url));
        } else {
          inset.get_inset(callback);
        }
      },
      inset_data:['inset_file', function(callback, results){
        inset.get_inset_data(callback, results);
      }],
      inset_template:['inset_file', function(callback, results){
        inset.get_inset_template(callback, results);
      }],
      compiled_inset:['inset_data', 'inset_template', function(callback, results){
        inset.compile(callback, results);
      }]
    }, function(err, results){
      results.status = results.inset_file.status;
      callback(err, results)
    });
  }
};

module.exports = inset;

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function getRandom() {
  var numbers = "";
  for (var i = 0; i < 6; i++) {
      numbers += randomIntInc(1,10);
  }
  return "insetData_"+numbers;
}
