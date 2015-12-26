/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var SCORES_FILE = path.join(__dirname, 'scores.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
