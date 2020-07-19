const admin = require("firebase-admin");

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
    .then((decodedToken) => {
      let uid = decodedToken.uid;
      console.log({ decodedToken });
      if (uid) {
        console.log("indide if");
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

module.exports = isAuthenticated;
