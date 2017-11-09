var should = require('should');
var request = require('supertest');
var Util = require('../util');
var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var Scenario = require('../scenarios/userScenario');
var moment = require('moment');

module.exports = function () {
    before(function (done) {
        Scenario.create(done);
    });

    it('should successfully login as SuperAdmin', successLoginAsSuperAdmin);
    it('should successfully login as MerchantAdmin', successLoginAsMerchantAdmin);
    it('should successfully login as Merchant', successLoginAsMerchant);
    it('should fail to login with username that dont exists', failUserNotExists);
    it('should fail to login with wrong password', failWrongPassword);
    it('should get new token when login twice', successRenewLogin);       

    after(function (done) {
        Scenario.destroy(done);
    });
}

function successLoginAsSuperAdmin(done) {
    var body = {
        username: Scenario.superAdmin.username,
        password: 'qwerty'
    }
    successLogin(body, done);
};

function successLoginAsMerchantAdmin(done) {
    var body = {
        username: Scenario.merchantAdmin.username,
        password: 'qwerty'
    }
    successLogin(body, done);
};

function successLoginAsMerchant(done) {
    var body = {
        username: Scenario.merchant.username,
        password: 'qwerty'
    }
    successLogin(body, done);
};

function successLogin(body, done) {
    request(Util.frontend.v1_Url)
        .post('/v1/login')
        .send(body)
        .expect(200)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.not.be.empty();
            res.body.should.have.property('token');
            res.body.should.have.property('username');
            res.body.should.have.property('firstName');
            res.body.should.have.property('lastName');
            res.body.should.have.property('contacts');
            res.body.should.have.property('avatar');

            done();
        });
}

function failUserNotExists(done) {
    var body = {
        username: "notExistingUser",
        password: "somepassword"
    };
    fail401(body, done);
};

function failWrongPassword(done) {
    var body = {
        username: Scenario.superAdmin.username,
        password: "wrongPassword"
    };
    fail401(body, done);
};

function fail401(body, done) {
    request(Util.frontend.v1_Url)
        .post('/v1/login')
        .send(body)
        .expect(401)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.not.be.empty();
            res.body.should.have.property('error', "Wrong username or password.");
            done();
        });
};

function successRenewLogin(done) {
    Scenario.createToken(Scenario.superAdmin, function () {
        var token = Scenario.superAdmin.token;

        var body = {
            username: Scenario.superAdmin.username,
            password: 'qwerty'
        }

        request(Util.frontend.v1_Url)
            .post('/v1/login')
            .send(body)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.body.should.not.be.empty();
                res.body.should.have.property('token');
                res.body.should.not.eql(token.value);
                res.body.should.have.property('username');
                res.body.should.have.property('firstName');
                res.body.should.have.property('lastName');
                res.body.should.have.property('contacts');
                res.body.should.have.property('avatar');
                done();
            });
    });
};