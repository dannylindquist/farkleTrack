var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();

var SCORES_FILE = path.join(__dirname, 'scores.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

app.get('/api/scores', function(req, res) {
  fs.readFile(SCORES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

app.post('/api/scores', function(req, res) {
  fs.readFile(SCORES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var scores = JSON.parse(data);
    var found = false;
    scores.map(function(data){
      if (data.name == req.body.name) {
        data.history.push(data.score);
        data.score = data.score + Number(req.body.score);
        found = true;
      }
    });
    if (found === false) {
      var newComment = {
        id: Date.now(),
        name: req.body.name,
        score: Number(req.body.score),
        history: []
      };
      scores.push(newComment);
    }
     
    fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(scores);
    });
  });
});

app.post('/api/clear', function(req, res){
  fs.readFile(SCORES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var scores = [];
     
    fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(scores);
    });
  });
});

app.get('/api/games', function(req, res) {
  fs.readFile(SCORES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
