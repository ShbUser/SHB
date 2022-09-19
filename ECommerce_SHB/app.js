require('dotenv').config()
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let db = require('./config/Connection');
let hbs = require('express-handlebars')

let usersRouter = require('./routes/users');
let adminRouter = require('./routes/admin');
const { handlebars } = require('hbs');

let app = express();


//  let fileUpload=require('express-fileupload');
// const upload = multer({ dest: "public/files" });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/',
  helpers: {
    formatDate: function (date) {
      let newdate = date.toDateString()
      return newdate.slice(3, 15)
    },
    eq: function (v1, v2) {
      return v1 == v2
    },
    neq: function (v1, v2) {
      return v1 != v2
    }
  }
}));

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//  app.use(fileUpload());

db.connect((err) => {
  if (err) Console.log("Connection err : " + err)
  else
    console.log("Database connection successfully")
})

app.use(session({ secret: "key", resave: true, saveUninitialized: true, cookie: { maxAge: 36000000 } }))


app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-store , private, no-store, must-revalidate,max-stale=0,post-check=0, pre-check=0')
  next()
})


app.use('/', usersRouter);
app.use('/admin', adminRouter);

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
