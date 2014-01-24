var express    = require('express');
var logfmt     = require("logfmt");
var _          = require('underscore');
var FreshBooks = require('freshbooks');
var app        = express();

app.use(express.bodyParser());

function getAll(collection, res){
  collection.list(function(err, resModels, options){
    var results = [], pages;
    if(err) {
      console.log(err);
      res.send(500);
    }

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
function js_yyyy_mm_dd_hh_mm_ss() {
  now = new Date();
  year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}
function apiUrl(req) {
  return req.query.api_url.toString().replace(/"/g, '');
}
function authToken(req) {
  return req.query.auth_token.toString().replace(/"/g, '');
}

app.get('/tasks', function(req, res){
  var freshbooks = new FreshBooks(apiUrl(req), authToken(req)),
      tasks = new freshbooks.Task();
  getAll(tasks, res);
});
app.get('/projects', function(req, res){
  var freshbooks = new FreshBooks(apiUrl(req), authToken(req)),
      projects = new freshbooks.Project();
  getAll(projects, res);
});
app.get('/staffs', function(req, res){
  var freshbooks = new FreshBooks(apiUrl(req), authToken(req)),
      staffs = new freshbooks.Staff();
  getAll(staffs, res);
});
app.post('/time_entries', function(req, res){
  var freshbooks = new FreshBooks(apiUrl(req), authToken(req)),
      timeEntry = new freshbooks.Time_Entry();

  timeEntry.project_id = req.body.time_entry.project_id;
  timeEntry.task_id    = req.body.time_entry.task_id;
  timeEntry.staff_id   = req.body.time_entry.staff_id;
  timeEntry.notes      = req.body.time_entry.notes;
  timeEntry.hours      = Number(req.body.time_entry.hours);
  timeEntry.date       = js_yyyy_mm_dd_hh_mm_ss();

  timeEntry.create(function(err, timeEntry){
    if(err) {
      console.log(err);
      res.send(500);
    }
    res.contentType('json');
    res.send(timeEntry);
  });
});

var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


