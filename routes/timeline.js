const express = require("express");

// import firebase function
const firebase = require("../config/firebase.config");

// import Classes
const calenderStyle = require("../utils/Classes/calenderStyle");

const router = express.Router();

/* GET timeline page. */
router.get("/timeline", function (req, res, next) {
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

  promiseEventList.then((response) => {
    res.render("timeline", { title: "原住民資訊", data: response });
  });
});

module.exports = router;
