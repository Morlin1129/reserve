var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var cookieParser = require('cookie-parser');
var session = require('express-session'); // 追加

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

// セッションの設定
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000
  }
}));


//セッションチェックする
var sessionCheck = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

//セッションチェックする
var sessionCheckJson = function(req, res, next) {
  // next();
  // if (req.session.user) {
  //   next();
  // } else {
  //   res.send({'error': 'セッションの有効期限が切れました'});
  // }
};

// app.use('/manager', login);
// app.use('/api/', sessionCheckJson);


// 一覧取得
app.get("/api/users", function(req, res) {
  users.find().toArray(function(err, items) {
    var mapped = items.map(function(item) {
      delete item.password;
      return item;
    })
    var filtered = mapped.filter(function(item) {
      return (item.account_id != 'admin')
    })
    res.send(filtered);
  });
});

// 個人取得()
app.get("/api/loginUser", function(req, res) {
  users.findOne({_id: mongodb.ObjectID(req.session.user._id)}, function(err, item) {
    res.send(item);
  });
});

// 個人取得
app.get("/api/users/:_id", function(req, res) {
  users.findOne({_id: mongodb.ObjectID(req.params._id)}, function(err, item) {
    delete item.password;
    res.send(item);
  });
});

// 追加・更新
app.post("/api/users", function(req, res) {
  sessionCheckJson(req,res);
  var user = req.body;
  if (user._id) user._id = mongodb.ObjectID(user._id);
  users.save(user, function() {
    res.send("insert or update");
  });
});

// 削除
app.delete("/api/users/:_id", function(req, res) {
  sessionCheckJson(req,res);
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

//共通の日付移行を取得
app.get("/api/reserves", function(req, res) {
  var today  = parseInt(new Date().toFormat('YYYYMMDD'), 10);
  console.log(today);
    reserves.find({date:{$gte:today}}).toArray(function(err, items) {
    res.send(items);
  });
});

// 追加・更新
app.post("/api/reserves/users", function(req, res) {
  sessionCheckJson(req,res);
  console.log('alerting:' + JSON.stringify(req.body));
  var reserve = req.body.reserve;
  if (reserve._id) reserve._id = mongodb.ObjectID(reserve._id);
  reserves.save(reserve, function() {
    res.send("insert or update");
  });
});

// 削除
app.delete("/api/reserves/:_id", function(req, res) {
  sessionCheckJson(req,res);
  reserves.remove({_id: mongodb.ObjectID(req.params._id)}, function() {
    res.send("delete");
  });
});

// ログイン
app.get("/api/login", function(req, res) {
  var id = req.query.account_id;
  var pw = req.query.password;
  users.findOne({account_id: id}, function(err, item) {
    if(item.password == pw) {
      delete item.password;
      req.session.user = item;
      res.send(item);
    }
  });
});
