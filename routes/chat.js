var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chatapps', { title: '原住民資訊' });
});

module.exports = router;
