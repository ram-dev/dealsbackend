/** 
 * Reset password Test
 * @version 1.0
 * ------------------------
 * A test to test the entire reset password api. 
 * 
 * Copyright © 2016 yofferz. All rights reserved.
 */

var should = require('should');
var request = require('supertest');
var Util = require('../util');
var dbModels = require('../../util/dbModels');
var db = require('../../data/repository');
var keygen = require('keygenerator')
var mongoose = require('../../data/repository');

var UserModel = mongoose.model(dbModels.userModel);
var Scenario = require('../scenarios/resetPwdScenario');

module.exports = function () {
    before(function (done) {
        Scenario.create(done);
    });

    // it('should fail if body not contains propery newpassword', failNoBodyParams);
    // it('should fail if no valid token as param', failInvalidToken);
    it('should fail if token expired', failTokenexpired);
    it('should successfully change password on correct token and new password', successResetPassword);
    it('should fail to reuse an old token', failReuseToken);

    after(function (done) {
        Scenario.destroy(done);
    });
};

function failNoBodyParams(done) {
    var token = Scenario.merchant.resetPasswordToken;
    var body = {};

    request(Util.frontend.v1_Url)
        .post('/v1/reset/' + token)
        .expect(400)
        .send(body)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.not.be.empty();
            res.body.should.have.property("error");
            done();
        });
};

function failInvalidToken(done) {
    var token = keygen.session_id({ length: 64 });
    var body = { newpassword: "Ab.\"19PI" };

    request(Util.frontend.v1_Url)
        .post('/v1/reset/' + token)
        .expect(404)
        .send(body)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.not.be.empty();
            res.body.should.have.property("error");
            done();
        });
};

function failTokenexpired(done) {
    var token = Scenario.merchant2.resetPasswordToken;
    var body = { newpassword: "Ab.\"19PI" };

    request(Util.frontend.v1_Url)
        .post('/v1/reset/' + token)
        .expect(409)
        .send(body)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.not.be.empty();
            res.body.should.have.property("error");
            done();
        });
};

function successResetPassword(done) {
    var token = Scenario.merchant.resetPasswordToken;
    var body = { newpassword: "Ab.\"19PI" };

    request(Util.frontend.v1_Url)
        .post('/v1/reset/' + token)
        .expect(200)
        .send(body)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.be.empty();

            UserModel.findOne({ _id: Scenario.merchant._id }, function (err, user) {
                if (err) {
                    throw new Error("Faild to get loginCred " + err.message);
                }

                (user.resetPasswordToken === undefined).should.be.true;
                (user.resetPasswordExpires === undefined).should.be.true;

                done();
            });
        });
};

function failReuseToken(done) {
    var token = Scenario.merchant3.resetPasswordToken;
    var body = { newpassword: "Ab.\"19PI" };

    request(Util.frontend.v1_Url)
        .post('/v1/reset/' + token)
        .expect(200)
        .send(body)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.be.empty();

            UserModel.findOne({ _id: Scenario.merchant3._id }, function (err, user) {
                if (err) {
                    throw new Error("Faild to get loginCred " + err.message);
                }

                (user.resetPasswordToken === undefined).should.be.true;
                (user.resetPasswordExpires === undefined).should.be.true;

                request(Util.frontend.v1_Url)
                    .post('/v1/reset/' + token)
                    .expect(404)
                    .send(body)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }

                        res.body.should.not.be.empty();
                        res.body.should.have.property("error");

                        done();
                    });
            });
        });
};