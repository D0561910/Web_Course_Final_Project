var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var admin = require('firebase-admin');
const multer = require("multer");
const moment = require("moment");

var chatRouter = require('./routes/chat');
var clanRouter = require('./routes/claninfo');
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var timelineRouter = require('./routes/timeline');

// load serviceAccountkey.json
var serviceAccount = require("./serviceAccountKey.json");

var app = express();

// firebase init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://webcoursedatabase.firebaseio.com"
});

var firebase = admin.database();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// set up session
const session = require("express-session");
const FileStore = require("session-file-store")(session);
var identityKey = "skey";
app.set("trust proxy", 1); // trust first proxy

app.use(
  session({
    name: identityKey,
    secret: "charles", // 用來對session id相關的cookie進行簽名
    store: new FileStore(), // 本地儲存session（文字檔案，也可以選擇其他store，比如redis的）
    saveUninitialized: false, // 是否自動儲存未初始化的會話，建議false
    resave: false, // 是否每次都重新儲存會話，建議false
    cookie: {
      maxAge: 3600 * 1000 // 有效期，單位是毫秒 1hour
      // expires: expiryDate
    }
  })
);

// Create Classes
class calenderStyle {
  constructor() {
    this.index = "";
    this.clan = "";
    this.info = "";
    this.month = "";
    this.name = "";
    this.warning = "";
  }
}

class claninfo {
  constructor() {
    this.about = "";
    this.ancestry = [];
    this.clan = "";
    this.customs = [];
    this.livelihood = [];
    this.village = "";
  }
}

class ancestry {
  constructor() {
    this.data = "";
    this.key = "";
  }
}

class customs {
  constructor() {
    this.data = "";
    this.event = [];
  }
}

class events {
  constructor() {
    this.title = "";
    this.eventInfos = [];
  }
}

class eventinfos {
  constructor() {
    this.datas = "";
  }
}

class livelihood {
  constructor() {
    this.data = "";
    this.keys = "";
  }
}

class msgList {
  constructor() {
    this.id = "";
    this.title = "";
    this.message = "";
    this.createby = "";
    this.createat = "";
  }
}

class msgBoard {
  constructor() {
    this.name = "";
    this.msg = "";
    this.commitat = "";
  }
}

//timeline
app.get("/timeline", function (req, res, next) {
  var calend = firebase.ref("/calender");
  const promiseEventList = new Promise((resolve, reject) => {
    calend.on("value", function (snapshot) {
      var data = snapshot.val();
      var calenderArray = [];
      for (let i in data) {
        var item = new calenderStyle();
        item.index = `${i}/01/2020`;
        item.clan = data[i].clan;
        item.info = data[i].info;
        item.month = data[i].month;
        item.name = data[i].name;
        item.warning = data[i].warning;
        calenderArray.push(item);
      }
      resolve(calenderArray);
    });
  });

  promiseEventList.then(response => {
    res.render('timeline', { title: '原住民資訊', data: response });
  });
});

app.get("/clan", function (req, res, next) {
  var eventDetails = firebase.ref("/ed");
  const promiseDetails = new Promise((resolve, reject) => {
    eventDetails.on("value", function (snapshot) {
      var data = snapshot.val();
      var clanArray = [];
      for (let i in data) {
        var clanclass = new claninfo();
        clanclass.about = data[i].about;
        clanclass.clan = data[i].clan;
        clanclass.village = data[i].village;

        // Process AncestryObject;
        var ancestryObj = data[i].ancestry;
        for (let j in ancestryObj) {
          var ancestryClass = new ancestry();
          ancestryClass.data = ancestryObj[j].data;
          ancestryClass.key = ancestryObj[j].key;
          clanclass.ancestry.push(ancestryClass);
        }

        // Process livelihoodObject
        var livelihoodObj = data[i].livelihood;
        for (let k in livelihoodObj) {
          var livelihoodClass = new livelihood();
          livelihoodClass.data = livelihoodObj[k].data;
          livelihoodClass.key = livelihoodObj[k].key;
          clanclass.livelihood.push(livelihoodClass);
        }

        // Process livelihoodObject
        var customsObj = data[i].customs;
        for (let l in customsObj) {
          var customsClass = new customs();
          var customsEventData = customsObj[l].event;
          customsClass.data = customsObj[l].data;
          for (let m in customsEventData) {
            var eve = new events();
            var eveinfo = customsEventData[m].event_info;
            eve.title = customsEventData[m].title;
            for (let n in eveinfo) {
              var evedata = new eventinfos();
              evedata.datas = eveinfo[n].data;
              eve.eventInfos.push(evedata);
            }
            customsClass.event.push(eve)
          }
          clanclass.customs.push(customsClass);
        }
        clanArray.push(clanclass);
      }
      resolve(clanArray);
    });
  });

  promiseDetails.then(response => {
    res.render('claninfo', { title: '原住民資訊', data: response });
  });
});

app.get("/chat", function (req, res, next) {
  res.render("chatapps", {
    title: '原住民資訊',
    islogined: false,
  });
});

app.get("/chats", function (req, res, next) {
  var sess = req.session;
  var loginUser = sess.loginUser;
  var userEmail = sess.userEmail;
  var isLogined = !!loginUser;
  req.session.prjId = " ";
  req.session.prj = " ";

  var usertokenID = sess.tokenID;
  var uid = sess.uid;

  var msgRef = firebase.ref("/messageboard");
  const msgArray = new Promise((resolve, reject) => {
    msgRef.on("value", function (snapshot) {
      var data = snapshot.val();
      var msgArray = [];
      for (let i in data) {
        var boardList = new msgList();
        boardList.id = i;
        boardList.title = data[i].title;
        boardList.message = data[i].message;
        boardList.createby = data[i].createby;
        boardList.createat = moment(data[i].createat).format('MMMM Do YYYY, h:mm:ss a');
        msgArray.push(boardList);
      }
      resolve(msgArray);
    });
  });

  msgArray.then(response => {
    res.render("chatapps", {
      title: '原住民資訊',
      islogined: isLogined,
      email: userEmail || "",
      name: loginUser || "",
      uid: uid || "",
      token: usertokenID,
      data: response
    });
  });
});

// Create authentication middleware
function isAuthenticated(req, res, next) {
  // check is user logged in
  // if they are, attach them to the request object and call next
  // if they are not, send them to the login pages
  // with a message saying : 'login!'

  var idToken = req.body.ids;
  // idToken comes from the client app
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(function (decodedToken) {
      let uid = decodedToken.uid;
      // console.log({ decodedToken });
      if (uid) {
        req.session.regenerate(function (err) {
          if (err) {

            return res.json({ ret_code: 2, ret_msg: "登入失敗" });
          }
          //here for user id.
          req.session.tokenID = idToken;
          req.session.loginUser = decodedToken.name;
          req.session.userEmail = decodedToken.email;
          req.session.uid = uid;
          next();
        });
      } else {
        // res.json({ ret_code: 1, ret_msg: '賬號或密碼錯誤' });
        res.redirect("/");
      }
    })
    .catch(function (error) {
      // Handle error
      res.redirect("/");
    });
}

app.post("/logins", isAuthenticated, function (req, res, next) {
  res.json({ ret_code: 0, ret_msg: "登入成功" });
});

app.post("/createMsg", function (req, res, next) {
  var sess = req.session;
  var uid = sess.uid;
  var loginUser = sess.loginUser;
  var title = req.body.title;
  var message = req.body.msg;
  var msgRef = firebase.ref("/messageboard");
  //   console.log(m);
  // console.log(moment(m).format('MMMM Do YYYY, h:mm:ss a'));

  msgRef.push({
    title: title,
    message: message,
    createby: loginUser,
    userid: uid,
    createat: moment.now()
  })

  res.send("Done");
});

app.post("/get_msg_info", function (req, res, next) {
  var msgRef = firebase.ref(`/messageboard/${req.body.key}`);

  const promiseGetMsgInfo = new Promise((resolve, reject) => {
    msgRef.on("value", function (snapshot) {
      var data = snapshot.val();
      var main = new msgBoard();
      var boardArray = [];
      main.name = data.createby;
      main.msg = `问题： ${data.message}`;
      main.commitat = moment(data.createat).format('MMMM Do YYYY, h:mm:ss a');
      boardArray.push(main);
      var msgArray = data.messages;
      for (let i in msgArray) {
        var second = new msgBoard();
        second.name = msgArray[i].commitby;
        second.msg = msgArray[i].message;
        second.commitat = moment(msgArray[i].commitat).format('MMMM Do YYYY, h:mm:ss a');
        boardArray.push(second);
      }
      resolve(boardArray);
    });
  });
  promiseGetMsgInfo.then(response => {
    res.json({ data: response, key: req.body.key });
  });


});

app.post('/sendMsg', function (req, res, next) {
  var sess = req.session;
  var msgRef = firebase.ref(`/messageboard/${req.body.key}/messages`);
  msgRef.push({
    commitat: moment.now(),
    commitby: sess.loginUser,
    message: req.body.msg
  });
  res.send("Done");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
