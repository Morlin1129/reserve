var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var dateutils = require('date-utils');

var app = express();
var users;
var reserves;

app.use(express.static('views'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.listen(process.env.PORT || 3000)

var corser = require("corser");
app.use(corser.create());
mongodb.MongoClient.connect("mongodb://heroku_cmz417h6:cb85ed5qou8nqrfita4pvrivgj@ds133281.mlab.com:33281/heroku_cmz417h6", function(err, database) {
// mongodb.MongoClient.connect("mongodb://localhost:27017/test", function(err, database) {
  users = database.collection("users");
  reserves = database.collection("reserves");
});

// 一覧取得
app.get("/api/users", function(req, res) {
  users.find().toArray(function(err, items) {
    res.send(items);
  });
});

// 個人取得
app.get("/api/users/:_id", function(req, res) {
  users.findOne({_id: mongodb.ObjectID(req.params._id)}, function(err, item) {
    res.send(item);
  });
});

// 追加・更新
app.post("/api/users", function(req, res) {
  var user = req.body;
  if (user._id) user._id = mongodb.ObjectID(user._id);
  users.save(user, function() {
    res.send("insert or update");
  });
});

// 削除
app.delete("/api/users/:_id", function(req, res) {
  users.remove({_id: mongodb.ObjectID(req.params._id)}, function() {
    res.send("delete");
  });
});

//共通の日付移行を取得
app.get("/api/reserves/users/:_id", function(req, res) {
  var today  = parseInt(new Date().toFormat('YYYYMMDD'), 10);
  console.log(today);
    reserves.find({owner: req.params._id, date:{$gte:today}}).toArray(function(err, items) {
    res.send(items);
  });
});

// 追加・更新
app.post("/api/reserves/users", function(req, res) {
  console.log('alerting');
  var reserve = req.body.reserve;
  if (reserve._id) reserve._id = mongodb.ObjectID(reserve._id);
  reserves.save(reserve, function() {
    res.send("insert or update");
  });
});

// 削除
app.delete("/api/reserves/:_id", function(req, res) {
  reserves.remove({_id: mongodb.ObjectID(req.params._id)}, function() {
    res.send("delete");
  });
});
