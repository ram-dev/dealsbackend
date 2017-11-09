
var Repository = require('./data/repository');
var router = require('./routes/router.js');
var dbModels = require('./util/dbModels');
var async = require('async');
var logger = require(__base + '/lib/util/logger');

var Storage = require('../../Storage');
var fs = require('fs');
var glob = require('glob');

function vsc(sink) {
    self = this;
    self.sink = sink;


    sink.on('loadRouter', function (express, callback) {
        var routes = router.createRoutes(express);
        callback(null, routes);
    });

    sink.on('loadDb', function (repository, callback) {
        Repository.createDb(function (err, connection) {
            if (err) {
                return callback(err);
            }            

            repository.add("vsc", connection);

            callback();
        });
    });

    sink.on('addCronJobs', function(cronManager, callback){
        callback();
    });
};

module.exports = vsc;
