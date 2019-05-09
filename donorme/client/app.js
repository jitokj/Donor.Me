var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//configuring hbs engine setup
var hbs = require('express-handlebars');

//for error handling
var createError = require('http-errors');


var indexRouter = require('./routes/index');

var app = express();
//configuring hbs engine setup

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname+'/views/layouts/'}));
app.set("views", path.join(__dirname,'views'));
app.set("view engine", 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

//configuring error handling for 404
app.use((req, res, next) => {
    next(createError(404));
});

//configuring error handling
app.use((req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    //render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
