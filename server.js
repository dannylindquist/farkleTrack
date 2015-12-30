var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var app = express();

var SCORES_FILE = path.join(__dirname, 'scores.json');

app.set('port', (process.env.PORT || 3000));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', function(req, res) {
  var cookies = String(req.cookies.roomName) == 'undefined' ? '' : req.cookies.roomName;
  console.log(req.cookies.roomName);
  if(cookies === '') {
    res.sendFile(path.join(__dirname, 'app/welcome.html'));
  } else {
    res.sendFile(path.join(__dirname, 'app/game.html'));
  }
});

app.get('/api/scores', function(req, res) {
  var cookies = String(req.cookies.roomName) === 'undefined' ? '' : req.cookies.roomName;
  if(cookies != '') {
    var roomName = 'games/' + req.cookies.roomName + '.json';
    console.log(roomName);
    fs.exists(path.join(__dirname, roomName), function(exists){
      if(exists) {
        fs.readFile(path.join(__dirname, roomName), function(err, data) {
          if (err) {
            console.error(err);
            process.exit(1);
          }
          res.setHeader('Cache-Control', 'no-cache');
          res.json(JSON.parse(data));
        });
      } else {
        var scores = [];
        fs.writeFile(path.join(__dirname, roomName), JSON.stringify(scores), function(err){
          if (err) {
            console.error(err);
            process.exit(1);
          }
          res.setHeader('Cache-Control', 'no-cache');
          res.json(scores);
        });
      }
    });
  }
});

app.post('/api/scores', function(req, res) {
  var file = path.join(__dirname, 'games/' + req.cookies.roomName + '.json');
  fs.readFile(file, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var scores = JSON.parse(data);
    var found = false;
    scores.map(function(data){
      if (data.name == req.body.name) {
        data.history.unshift(data.score);
        data.score = data.score + Number(req.body.score);
        found = true;
      }
    });
    if (found === false) {
      var newScore = {
        id: Date.now(),
        name: req.body.name,
        score: Number(req.body.score),
        history: []
      };
      scores.push(newScore);
    }
     
    fs.writeFile(file, JSON.stringify(scores, null, 4), function(err) {
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
  var file = path.join(__dirname, 'games/'+req.cookies.roomName + '.json');
  fs.readFile(file, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var scores = [];
     
    fs.writeFile(file, JSON.stringify(scores, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(scores);
    });
  });
});

app.post('/api/getgame', function(req, res) {
  console.log(req.cookies);
  res.redirect('../');
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
