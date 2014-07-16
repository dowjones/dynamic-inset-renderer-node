#Dynamic Inset Renderer for Node.js
##Server-side inset.json rendering

Based on the [dynamic inset renderer](https://github.com/dowjones/dynamic-inset-renderer.git),
this library implements the most basic aspects of the [inset.json](https://docs.google.com/a/wsj.com/document/d/1NQ0UZYnyq89RFg3-Y7WxmYr7qVhsVBIrNPDpmgF66JA/edit?usp=docslist_api) spec.

###Installation
```javascript
npm install dynamic-inset
```

###Requirements
Dynamic insets require a discoverable inset.json file (that conforms to the [inset.json spec](https://docs.google.com/a/dowjones.com/document/d/1NQ0UZYnyq89RFg3-Y7WxmYr7qVhsVBIrNPDpmgF66JA/edit?usp=sharing)).
The inset should have either additional discoverable assets, or in-line data and/or templates
to use to create the rendered inset.

The default renderer for insets is hogan, but the [advanced example](#advanced-use-cases) in this documentation shows
how the rendering engine can be swapped out for another mustache renderer, or a different
templating syntax entirely.


###Usage
```javascript
//include the module
var inset = require('dynamic-inset');

//request the inset
inset.render("http://dynamic-inset-assets.herokuapp.com/inset/inset.json", function(err, results){
  //do something with the inset
  console.log(results.compiled_inset);
});
```
The result of `results.compiled_inset` is a fully-rendered string of html code, ready to be inserted into a document.
The `results` object is a collection of the responses to each step of the async processing on the various parts of
the inset processing steps:

###results.compiled_inset
```html
<h1>First Inset</h1>
<p>The content of this inset is from a json file. and the template is from a mustache file.</p>
<ul>
  <li>dog</li>
  <li>cat</li>
  <li>goat</li>
</ul>
```
###The complete results object
```javascript
{
  inset_file: {
    status: 'OK',
    type: 'InsetDynamic',
    platforms: [ 'desktop' ],
    serverside: { data: [Object], template: [Object] },
    sharing: false
  },
  inset_template: '<h1>{{title}}</h1>\n<p>{{importantstuff}}</p>\n{{#list.length}}\n<ul>\n{{#list}}<li>{{.}}</li>{{/list}}\n</ul>{{/list.length}}\n',
  inset_data: {
    title: 'First Inset',
    list: [ 'dog', 'cat', 'goat' ],
    importantstuff: 'The content of this inset is from a json file. and the template is from a mustache file.'
  },
  compiled_inset: '<h1>First Inset</h1>\n<p>The content of this inset is from a json file. and the template is from a mustache file.</p>\n<ul>\n<li>dog</li><li>cat</li><li>goat</li>\n</ul>\n' }
}
```

###Alternate usage
The inset object's url property can be set manually before execution, as a convenience.
```javascript
//include the module
var inset = require('dynamic-inset');

//set the url
inset.url = 'http://dynamic-inset-assets.herokuapp.com/inset/inset.json';

//render, using only a function as a param
inset.render(function(err, results){
  console.log(results.compiled_inset);
});
```

###Inline inset usage
A string of an inset can be passed to the renderer to render directly.
```javascript
var insetString = JSON.stringify({
  "status": "OK",
  "type": "InsetDynamic",
  "platforms": ["desktop"],
  "serverside": {
    "data": {
      "data":{"title":"hello"}
    },
    "template": {
      "template": "<h1>{{title}}</h1>"
    }
  }
});

inset.render(insetString, function(err, results){
  console.log(results.compiled_inset);
});
```

###Advanced use-cases
Individual functions can be overloaded with alternatives.
In this example, hogan is swapped out for the standard mustache renderer.
```javascript
var inset = require('dynamic-inset')
  , mustache = require('mustache');

//overload the compile function with an alternate renderer
inset.compile = function(callback, results) {
  callback(null, mustache.render(results.inset_template, results.inset_data);
}

//request the inset
inset.render("http://dynamic-inset-assets.herokuapp.com/inset/inset.json", function(err, results){
  //output will be rendered with mustache, instead of hogan
  console.log(results.compiled_inset);
});
```
