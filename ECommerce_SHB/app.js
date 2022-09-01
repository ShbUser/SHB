let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session=require('express-session');
let db=require('./config/Connection');
let hbs=require('express-handlebars')
//let multer=require('multer')

let usersRouter = require('./routes/users');
let adminRouter = require('./routes/admin');
const { handlebars } = require('hbs');

let app = express();


//  let fileUpload=require('express-fileupload');
// const upload = multer({ dest: "public/files" });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// hhbshelpers = hbs.create({})
// hhbshelpers.handlebars.registerHelper('ifCond', function(v1, v2, options) {
//   if(v1 === v2) {
//      return options.fn(this);
//   }
//    return options.inverse(this);
// });

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',
  helpers:{
    format:function(date){
       let newdate= date.toDateString()
      return newdate.slice(3,15)
    }

  //   neq:function(v1,v2) {return v1 != v2}
  }
}));
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//  app.use(fileUpload());
// app.use(multer())

db.connect((err)=>{
  if (err) Console.log("Connection err : "+err)
  else
  console.log("Database connection successfully")
})

app.use(session({secret:"key", resave:true, saveUninitialized:true,cookie:{maxAge:360000}}))

// app.use(function (req,res,next) {
//   res.header('Cache-Control','no-store')
//   next()
// })

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
