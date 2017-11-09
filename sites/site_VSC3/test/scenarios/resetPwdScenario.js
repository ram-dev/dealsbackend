/** 
 * Reset password Scenario
 * @version 1.0
 * ------------------------
 * This module creates a scenario of several users ( clients, clinicians, clinic admins and super admins)
 * sets login token to them and sets reset password tokens to some of them. 
 * 
 * Copyright © 2016 yofferz. All rights reserved.
 */

var mongoose = require('../../data/repository');
var async = require('async');
var dbModels = require('../../util/dbModels');
var keygen = require('keygenerator')

var UserModel = mongoose.model(dbModels.userModel);
var UserScenario = require('./userScenario');

const EXPIRATION_TIME = 3600000;

var Scenario = module.exports = {
    create: function (done) {
        async.waterfall([
            function (callback) {
                UserScenario.create(callback);
            },
            function(callback){
                createResetToken(UserScenario.merchant, callback);
            },
            function(callback){
                createExpiredResetToken(UserScenario.merchant2, callback);
            },
            function(callback){
                createResetToken(UserScenario.merchant3, callback);
            }
        ], function (err, results) {
            if (err) {
                throw new Error(err.message);
            }

            Scenario.merchant = UserScenario.merchant;
            Scenario.merchant2 = UserScenario.merchant2;
            Scenario.merchant3 = UserScenario.merchant3;
            done();
        });
    },
    destroy: function (done) {
        async.parallel([
            function (callback) {
                UserScenario.destroy(callback);
            },
        ], function (err, results) {
            if (err) {
                throw new Error(err.message);
            }
            done();
        });
    }
};

function createResetToken(user, callback){
    user.resetPasswordToken = keygen.session_id({ length: 64 });
    user.resetPasswordExpires = Date.now() + EXPIRATION_TIME;

    user.save(function(err){
        callback(err);
    });
}

function createExpiredResetToken(user, callback){
    user.resetPasswordToken = keygen.session_id({ length: 64 });
    user.resetPasswordExpires = Date.now() - EXPIRATION_TIME;

    user.save(function(err){
        callback(err);
    });
}