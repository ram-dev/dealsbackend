var should = require('should');
var request = require('supertest');
var Util = require('../util');
var async = require('async');
var dbModels = require('../../util/dbModels');
var db = require('../../data/repository');

var TokenModel = db.model(dbModels.tokenModel);
var Scenario = require('../scenarios/userScenario');

module.exports = function () {
    before(function (done) {
        async.waterfall([
            function (cb) {
                Scenario.create(cb);
            },
            function (cb) {
                Scenario.createToken(Scenario.merchant, cb);
            }
        ], done);
    });

    it('should sucessfully logout an already logged in user', successLogout);
    it('should receive error code 401 when logout with old token', failLogoutOldToken);
    it('should receive error code 401 when logout with invalid token token', failLogoutInvalidToken);
    

    after(function (done) {
        Scenario.destroy(done);
    });
};

function successLogout(done) {
    var headers = {
        'authorization': 'Bearer ' + Scenario.merchant.token.value
    };
    request(Util.frontend.v1_Url)
        .post('/v1/logout')
        .set(headers)
        .expect(200)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.be.empty();
            var TokenModel = db.model(dbModels.tokenModel);
            TokenModel.findOne({ _Id: Scenario.merchant.token._Id }, function (err, token) {
                if (err) {
                    throw error;
                }

                (token == undefined).should.be.true();
                done();
            });            
        });
};

function failLogoutOldToken(done) {
    var headers = {
        'authorization': 'Bearer ' + Scenario.merchant.token.value
    };
    request(Util.frontend.v1_Url)
        .post('/v1/logout')
        .set(headers)
        .expect(401)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.be.empty();
            done();
        });
};

function failLogoutInvalidToken(done) {
    var headers = {
        'authorization': 'Bearer invalidToekn238374298yjhrkdf3093'
    };
    request(Util.frontend.v1_Url)
        .post('/v1/logout')
        .set(headers)
        .expect(401)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.be.empty();
            done();
        });
}
