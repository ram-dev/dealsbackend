var mongoose = require('mongoose');
var config = require('../config');


var Repository = require('../data/repository');
console.log('rrrr 123123');
Repository.createDb(function(err, connection){
    Repository.initModels(connection);
});

var testFragmentsFrontendAPI = require('./testFragmentsFrontendAPI');


module.exports = function () {
    before(function (done) {
     
        done();
    });

    describe('Frontend API', testFragmentsFrontendAPI);  

    after(function (done) {
        mongoose.connection.close();
        done();
    });
}
