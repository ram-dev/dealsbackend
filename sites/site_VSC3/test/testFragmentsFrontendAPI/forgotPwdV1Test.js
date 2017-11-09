var should = require('should');
var request = require('supertest');
var Util = require('../util');
var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');

var Scenario = require('../scenarios/userScenario');

module.exports = function () {
    before(function (done) {
        Scenario.create(done);
    });

    it('should successfully send request for reset password to existing email', successfullySendForgotExistEmail);
    it('should successfully send request for reset password to non existing email', successfullySendForgotNonExistEmail);
    it('should fail to send requiest for reset password without email property in body', failsendForgotNoEmail);

    after(function (done) {
        Scenario.destroy(done);
    });
};

function successfullySendForgotExistEmail(done) {
    var body = {
        email: Scenario.merchant.username
    }
    request(Util.frontend.v1_Url)
        .post('/v1/forgot')
        .send(body)
        .expect(200)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.be.empty();

            var loginModel = mongoose.model(dbModels.userModel);
            loginModel.findOne({username: Scenario.merchant.username}, function(err, login){
                
                (login.resetPasswordToken === undefined).should.be.false;
                (login.resetPasswordExpires === undefined).should.be.false;     

                done();           
            });

            
        });
};

function successfullySendForgotNonExistEmail(done) {
    var body = {
        email: "noneExistingUser@gmail.com"
    }
    request(Util.frontend.v1_Url)
        .post('/v1/forgot')
        .send(body)
        .expect(200)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.be.empty();
            var loginModel = mongoose.model(dbModels.userModel);
            loginModel.findOne({username: Scenario.merchant.username}, function(err, login){
                
                (login === undefined).should.be.true;

                done();               
            });
        });
};

function failsendForgotNoEmail(done) {
    var body = {
    }
    request(Util.frontend.v1_Url)
        .post('/v1/forgot')
        .send(body)
        .expect(400)
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            res.body.should.not.be.empty();
            res.body.should.have.property("error");

            done();
        });
}
