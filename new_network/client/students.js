var express = require('express');
var bodyParser = require('body-parser')

var app = express();
var urlencodeParser = bodyParser.urlencoded({extended: false});

app.use('/public', express.static('public'));

app.set('view engine', 'ejs');

app.get('/addMarks', function(req, res){
  res.render('addMarks')
})

app.post('/addMarks', urlencodeParser, function(req, res){
  // res.render('post_success', {data: req.body});
  res.render('marksAdded', {data: req.body});
  
})

app.listen(3000)
