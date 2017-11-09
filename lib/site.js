var inherits = require('util').inherits;

var Site = function (SiteInstance, siteName) {
    this.calls = new Map()
    this.name = siteName;
    this.instance = new SiteInstance(this);
};


Site.prototype.loadRouter = function (express, done) {
    var func = this.calls['loadRouter'];
    if (func != undefined) {
        func(express, done);
    }
    else {
        process.nextTick(done(null, []));
    }
}

Site.prototype.loadDb = function (cwcDb, done) {
    var func = this.calls['loadDb'];
    if (func != undefined) {
        func(cwcDb, done);
    }
    else {
        process.nextTick(done());
    }
};

Site.prototype.addCronjobs = function (cron, done) {
    var func = this.calls['addCronJobs'];
    if (func != undefined) {
        func(cron, done);
    }
    else {
        done();
    }
}

Site.prototype.on = function (cmd, func) {
    if (!this.calls.has(cmd)) {
        this.calls[cmd] = func;
    }
}

module.exports = Site;