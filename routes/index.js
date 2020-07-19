var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("home", { title: "原住民資訊" });
});

module.exports = router;
