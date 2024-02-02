const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const cookie = require('cookie-session');
const flash = require('connect-flash');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const indexRouter = require('./v1/routes/index');
const usersRouter = require('./v1/routes/users');
const indexAdminRouter = require('./admin/routes/index');
const adminRouter = require('./admin/routes/admin');
const bookingRouter = require('./v1/routes/booking')

const app = express();



app.use(flash());

app.use(
  cookie({
    // Cookie config, take a look at the docs...
    secret: 'I Love India...',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true
    },
  }),
);


//Database connection with mongodb
const mongoose = require('./config/database');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/v1/', indexRouter);
app.use('/v1/users', usersRouter);
app.use('/', indexAdminRouter);
app.use('/admin', adminRouter);
app.use('/v1/booking' , bookingRouter)


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API",
    },
    servers: [
      {
        url: "http://13.51.106.139:6001/",
      },
    ],
  },
  apis: ["./v1/routes/*.js"], // Check this path
};

const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log("err..........", err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;