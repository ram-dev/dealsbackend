var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');
var morgan = require('morgan');
var logger = require('../util/logger');

module.exports = {
    setup: function (app) {
        app.use(function(req, res, next) {
            req.socket.on("error", function() {
                console.log("Socket error on req: " + JSON.stringify(req));
            });
            if (res.socket != undefined) {
                res.socket.on("error", function() {
                    console.log("Socket error on res: " + JSON.stringify(res));
                });
            }
            next();
        });
        
        app.use(methodOverride());
        app.use(morgan('combined'));
        app.use(setHeaders);
        app.use(passport.initialize());

        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        app.use(logger.loggerMiddleware);
        app.use(logger.exceptionMiddleware);
        process.on('uncaughtException', logger.logAndCrash);        
    }
};

function setHeaders(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "authorization, origin, x-requested-with, content-Type, accept");

    next();
}