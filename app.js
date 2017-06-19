/**express-locallibrary-tutorial
SET DEBUG=express-locallibrary-tutorial:* & npm run devstart
www file > var debug = require('debug')('express-locallibrary-tutorial:server');
package.json file > "devstart": "nodemon ./bin/www"
First let’s add code to connect to the server and the database mymongo.
MONGO DB Server is at C:\Program Files\MongoDB\Server\3.4\bin
mongod --dbpath=/data --port 27017
node populatedb mongodb://localhost:27017/dblocallib2
**/
var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

//Then we require() modules from our routes directory.
//These modules/files contain code for handling particular sets of related "routes" (URL paths)
var index = require('./routes/index');//module.exports
var users = require('./routes/users');//router.get('/', function(req, res, next) {
var catalog = require('./routes/catalog'); //object with routes

console.log("this is catalog :"+ catalog);

var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost:27017/dblocallib2';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
/**
var dbConfig = require('./db');
var mongoose = require('mongoose');
// Connect to DB
mongoose.connect(dbConfig.url);
 db
 module.exports = {
  //'url' : 'mongodb://<dbuser>:<dbpassword>@novus.modulusmongo.net:27017/<dbName>'
  'url' : 'mongodb://localhost:27017/auth'
}
**/


// view engine setup
//First we set the 'views' value to specify the folder where the templates
//will be stored (in this case the sub folder /views).
app.set('views', path.join(__dirname, 'views'));//PUG files html views

//Then we set the 'view engine' value to specify the template library (in this case "pug").
app.set('view engine', 'pug');

//The next set of functions call app.use() to add the middleware
//libraries into the request handling chain.
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add this after the bodyParser middlewares!
app.use(cookieParser());

//In addition to the 3rd party libraries we imported previously, we use the Express.static middleware
//to get Express to serve all the static files in the directory /public in the project root.
app.use(express.static(path.join(__dirname, 'public')));//style sheet

//Now that all the other middleware is set up, we add our (previously imported)
//route-handling code to the request handling chain. The imported code will define
//particular routes for the different parts of the site
app.use('/', index);
app.use('/users', users);
app.use('/catalog', catalog);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
