const express = require("express");
const moment = require("moment");
// import firebase function
const firebase = require("../config/firebase.config");
// import Classes
const msgList = require("../utils/Classes/msgList");
const msgBoard = require("../utils/Classes/msgBoard");

const router = express.Router();

/* GET chat login  page. */
router.get("/chat", (req, res, next) => {
  res.render("chatapps", {
    title: "原住民資訊",
    islogined: false,
  });
});

router.get("/chats", (req, res, next) => {
  console.log(`${req.session}`);
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
        boardList.createat = moment(data[i].createat).format(
          "MMMM Do YYYY, h:mm:ss a"
        );
        msgArray.push(boardList);
      }
      resolve(msgArray);
    });
  });

  msgArray.then((response) => {
    res.render("chatapps", {
      title: "原住民資訊",
      islogined: isLogined,
      email: userEmail || "",
      name: loginUser || "",
      uid: uid || "",
      token: usertokenID,
      data: response,
    });
  });
});

router.post("/createMsg", (req, res, next) => {
  var sess = req.session;
  var uid = sess.uid;
  var loginUser = sess.loginUser;
  var title = req.body.title;
  var message = req.body.msg;
  var msgRef = firebase.ref("/messageboard");

  msgRef.push({
    title: title,
    message: message,
    createby: loginUser,
    userid: uid,
    createat: moment.now(),
  });

  res.send("Done");
});

router.post("/get_msg_info", (req, res, next) => {
  var msgRef = firebase.ref(`/messageboard/${req.body.key}`);

  const promiseGetMsgInfo = new Promise((resolve, reject) => {
    msgRef.on("value", function (snapshot) {
      var data = snapshot.val();
      var main = new msgBoard();
      var boardArray = [];
      main.name = data.createby;
      main.msg = `问题： ${data.message}`;
      main.commitat = moment(data.createat).format("MMMM Do YYYY, h:mm:ss a");
      boardArray.push(main);
      var msgArray = data.messages;
      for (let i in msgArray) {
        var second = new msgBoard();
        second.name = msgArray[i].commitby;
        second.msg = msgArray[i].message;
        second.commitat = moment(msgArray[i].commitat).format(
          "MMMM Do YYYY, h:mm:ss a"
        );
        boardArray.push(second);
      }
      resolve(boardArray);
    });
  });
  promiseGetMsgInfo.then((response) => {
    res.json({ data: response, key: req.body.key });
  });
});

router.post("/sendMsg", (req, res, next) => {
  var sess = req.session;
  var msgRef = firebase.ref(`/messageboard/${req.body.key}/messages`);
  msgRef.push({
    commitat: moment.now(),
    commitby: sess.loginUser,
    message: req.body.msg,
  });
  res.send("Done");
});

module.exports = router;
