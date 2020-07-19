var express = require("express");
const isAuthenticated = require("../utils/isAuthenticated");

var router = express.Router();

/* logins route. */
router.post("/logins", isAuthenticated, function (req, res, next) {
  res.json({ ret_code: 0, ret_msg: "登入成功" });
});

module.exports = router;
