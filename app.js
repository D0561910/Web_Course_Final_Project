const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require("multer");

// import session module
const session = require("express-session");
const FileStore = require("session-file-store")(session);

// import Route
const chatRouter = require("./routes/chat");
const clanRouter = require("./routes/claninfo");
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const timelineRouter = require("./routes/timeline");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// set up session
const identityKey = "skey";
app.set("trust proxy", 1); // trust first proxy

app.use(
  session({
    name: identityKey,
    secret: "charles", // 用來對session id相關的cookie進行簽名
    store: new FileStore(), // 本地儲存session（文字檔案，也可以選擇其他store，比如redis的）
    saveUninitialized: false, // 是否自動儲存未初始化的會話，建議false
    resave: false, // 是否每次都重新儲存會話，建議false
    cookie: {
      maxAge: 3600 * 1000, // 有效期，單位是毫秒 1hour
      // expires: expiryDate
    },
  })
);

app.use("/", indexRouter);
app.use("/", timelineRouter);
app.use("/", clanRouter);
app.use("/", chatRouter);
app.use("/", loginRouter);

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  port: "3306",
  database: "database_development",
});

connection.connect();

var sql = "SELECT * FROM Users";

connection.query(sql, function (err, result) {
  if (err) {
    console.log("[SELECT ERROR] - ", err.message);
    return;
  }

  // console.log(result);
  for(let i in result){
    console.log(`${i} + ${result[i]}`)
  }
});

connection.end();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
