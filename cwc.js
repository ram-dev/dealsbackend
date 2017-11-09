var app = require('./');
var async = require('async');
var path = require('path');
var siteLoader = require('./lib/siteLoader');
var setupExpress = require('./lib/routes/setupExpress');
var config = require('./config');
var fs = require("fs");

var sites, express;

global.__base = __dirname + '/';

async.waterfall([  
    function createExpress(callback) {
        express = new app.Express();
        setupExpress.setup(express);
        callback();
    },
    function loadSites(callback) {
        var dir = path.join(__dirname, "sites");
        sites = siteLoader.loadSites(dir);
        callback();
    },
    function initSites(callback) {
        async.eachSeries(sites, function (site, cb1) {
            console.log('Loading site ' + site.name);
            async.waterfall([
                function (cb2) {
                    siteLoader.createLocalDb(site, app.Repository, cb2);
                },
                function (cb2) {
                    siteLoader.createLocalRoutes(site, express, cb2);
                }                
            ], function (err) {
                if (err) {
                    console.log(err.message);
                    console.log('Faild to init Site: ' + site.name);
                }
                cb1();
            });
        }, function (err) {
            if (err) {
                console.log(err.message);
            }
            callback();
        });
    },
    function startExpress(callback) {
       
        var cwcServer = express.listen(app.Config.server.port, function () {
            var host = cwcServer.address().address;
            var port = cwcServer.address().port;           
            console.log('CwC Server listen at http://%s:%s', host, port);
            callback();
        });
    }   
], function (err) {
    if (err) {
        console.log('Error CWC Server halted due to \r\n ' + err.message);
        return;
    }
    console.log('CWC Server is running');
});

