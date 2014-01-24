var express    = require('express');
var logfmt     = require("logfmt");
var _          = require('underscore');
var FreshBooks = require('freshbooks');
var app        = express();

app.use(express.bodyParser());
// http://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

function getAll(collection, res){
  collection.list(function(err, resModels, options){
    var results = [], pages;
    if(err) {
      console.log(err);
      res.send(500);
    }
    //console.log('page 1');

    results = resModels;
    pages = Number(options.pages)
    var pageCounter = 1;
    if(pages > 1) {
      for(var i = 2; i <= pages; i++) {
        collection.list({page: i}, function(err, pageModels, options){
          if(err) { throw err; }

          pageModels.forEach(function(val) {
            results.push(val);
          })

          if(++pageCounter === pages) {
            //console.log('send results', pageCounter, pages);
            res.send(results);
          } else {
            //console.log('counter', pageCounter, 'pages', pages);
          }
        });
      }
    } else {
      console.log('pages is 1 or 0', results.length);
      res.send(results);
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


