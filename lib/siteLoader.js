var fs = require('fs');
var path = require('path');
var site = require('./site');

function loadSites(dir) {
    var result = [];

    fs.readdirSync(dir).forEach(function (file) {
        if (!fs.statSync(path.join(dir, file)).isDirectory()) {
            return;
        }

        try {
            var c = require(path.join(dir, file));
            result.push(new site(c, file));
        } catch (error) {
            console.error('Failed to load site with name ' + file + ' This site will not be loaded and used.');
            console.error('Error: ' + error);
        }
    });

    return result;
};

function createLocalDb(site, repository, callback) {
    process.stdout.write("loading database for site: " + site.name + "...");
    site.loadDb(repository, function (err, results) {
        if (err) {
            return callback(err);
        }
        console.log(' - Done');
        callback();
    });
};

function createLocalRoutes(site, express, callback) {
    process.stdout.write("loading endpoints for site: " + site.name + "...");
    site.loadRouter(express, function (err, result) {
        if (err) {
            return callback(err);
        }
        console.log(' - Done');

        result.forEach(function (routeInfo) {
            express.use(routeInfo.api, routeInfo.router);
            console.log('Created endpoint ' + routeInfo.api);
        }, this);

        callback();
    });
};

function addCronJobs(site, cron, callback) {
    process.stdout.write("loading cronjobs for site: " + site.name + "...");
    site.addCronjobs(cron, function (err, result) {
        if (err) {
            return callback(err);
        }
        console.log(' - Done');

        callback();
    });
}

module.exports = {
    loadSites: loadSites,
    createLocalDb: createLocalDb,
    createLocalRoutes: createLocalRoutes,
    addCronJobs: addCronJobs
}