var express = require("express");

// import firebase function
const firebase = require("../config/firebase.config");

// import Classes
const claninfo = require("../utils/Classes/claninfo");
const ancestry = require("../utils/Classes/ancestry");
const livelihood = require("../utils/Classes/livelihood");
const customs = require("../utils/Classes/customs");
const eventinfos = require("../utils/Classes/eventinfos");
const events = require("../utils/Classes/events");

var router = express.Router();

/* GET clan information page. */
router.get("/clan", (req, res, next) => {
  var eventDetails = firebase.ref("/ed");
  const promiseDetails = new Promise((resolve, reject) => {
    eventDetails.on("value", (snapshot) => {
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
            customsClass.event.push(eve);
          }
          clanclass.customs.push(customsClass);
        }
        clanArray.push(clanclass);
      }
      resolve(clanArray);
    });
  });

  promiseDetails.then((response) => {
    res.render("claninfo", { title: "原住民資訊", data: response });
  });
});

module.exports = router;
