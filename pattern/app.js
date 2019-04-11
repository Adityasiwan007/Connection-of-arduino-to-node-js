var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var helmet = require('helmet');
var app = express();
let associate = express();
var winston = require('winston');
var config = require('./config');
var security = require('./routes/auth');
var user = require('./routes/users.js');
const eventListner = require('./event_listners')
winston.add(winston.transports.File, { filename: 'applog.log', level: 'debug' });
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
});
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,x-access-token");
//     next();
// });

app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));
app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function(req, res, next) {
    if (req.body.userName) { //login mail id 
        req.body.userName = req.body.userName.toLowerCase();
    }

    if (req.body.pwd) { 
        req.body.pwd = req.body.pwd.toLowerCase();
    }
    next();
});

let associateSecurity = require('./routes/auth_associate')
let customerVisits = require('./routes/user/customer_visits')
let associateRouter = require('./routes/associate')
let associateAssistance = require('./routes/associate_assistance')
let associateStore = require('./routes/associate_store')
associate.use('/auth',associateSecurity.auth)
associate.use((req,res,next)=>{
  winston.log('verifying associate request')  
  associateSecurity.verify(req,res,next)
})
associate.use('/store',associateStore)
associate.use('/user',associateRouter)
associate.use('/customer-visits',customerVisits)
app.use('/spotlight/associate',associate)
app.use('/spotlight/associate/assistance',associateAssistance)
let store = require('./routes/store.js')
app.use('/spotlight/user/auth', security.auth);
app.use('/spotlight/user/add', user.createUser);
//all the path bellow this function requires, authentication
app.use(function(req, res, next) {
    winston.log('info', 'verifying the request');
    security.verify(req, res, next);
});

app.use('/spotlight/store',store)
app.use('/spotlight/user',user.router)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.json({ 'success': false, 'message': err });
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        winston.log('error', err);
        res.json({ 'success': false, 'message': `error on server ${err}` });
    });
}

// production error handler, express identifies the error handler by seeing the fucntion signature (there should be 4 )
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    winston.log('error', err);
    res.json({ 'success': false, 'message': `error on server ${err}` });
});

mongoose.connect(config.mongodb, { server: { reconnectTries: Number.MAX_VALUE } }, function(err) {
    if (err) {
        winston.log('info', 'Couldnt connect to MongoDB:', err);
    } else {
        winston.log('info', 'Connected to MongoDB');
    }
});

module.exports = app;