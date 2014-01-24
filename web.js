var express    = require('express');
var logfmt     = require("logfmt");
var _          = require('underscore');
var FreshBooks = require('freshbooks');
var app        = express();

function getAll(collection, res, options){
  collection.list(function(err, resModels, options){
    var results = [], pages;
    if(err)
      throw  err;

    results.push(resModels);
    if(pages = Number(options.pages)) {
      if(pages > 1) {
        for(var i = 2; i <= Number(options.pages); i++) {
          collection.list({page: i}, function(err, pageModels){
            if(err) { throw err; }
            results.push(pageModels);
            if(i > pages) {
              res.send(_.flatten(results));
            }
          });
        }
      }
    } else {
      res.send(_.flatten(results));
    }
  });
}

app.get('/tasks', function(req, res, options){
  var freshbooks = new FreshBooks(req.query.api_url, req.query.auth_token),
      tasks = new freshbooks.Task();
  getAll(tasks, res, options);
});
app.get('/projects', function(req, res, options){
  var freshbooks = new FreshBooks(req.query.api_url, req.query.auth_token),
      projects = new freshbooks.Project();
  getAll(projects, res, options);
});
app.get('/staffs', function(req, res, options){
  var freshbooks = new FreshBooks(req.query.api_url, req.query.auth_token),
      staffs = new freshbooks.Staff();
  getAll(staffs, res, options);
});

console.log('Listening on port 3000');
var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


