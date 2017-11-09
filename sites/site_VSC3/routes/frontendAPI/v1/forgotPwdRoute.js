/** 
 * Forgot Module Router
 * @version 3.0
 * ------------------------
 * This module handles the post request and
 * create a resetPassword token that will be sent to the user throught email.
 * 
 * Copyright © 2017 yofferz. All rights reserved.
 */

var bcrypt = require('bcrypt-nodejs');
var dbModels = require('../../../util/dbModels');
var async = require('async');
var restHelper = require('../../../util/restHelper');
var keygen = require("keygenerator");
var forgotPwdMailSender = require('../../../util/forgotPwdMailSender');
var fs = require('fs');
var Storage = require(__base).Storage;
var Config = require('../../../config');

const STRINGS = {
    HEADER_SUBJECT: "VSC - Forgotten password",
    ERROR_FAILED_SEND_EMAIL: "Failed to send forgot password email to "  
}

const PATH_FORGOT_PASSWORD = '/ForgotPasswordBody.xml';

const USER_RESPONSE ={
    ERROR_MISSING_PROPERTY: "missing property: email"    
}

var expirationTime = Config.constants.expirationTime || 3600000;

module.exports.use = function (Router) {
    Router.post('/v1/forgot', Post());
};

/**
 * create a chain of route logic to send a email to the user with 
 * reset password information.
 */
function Post() {
    return [
        /**
         * Searches for logincredentials based on the email address in the body.
         * @param  {Object} req
         * @param  {Object} res
         * @param  {Object} next
         */
        function getUser(req, res, next) {
            var email = req.body.email;
            if (email == undefined) {
                return restHelper.badRequest(res, USER_RESPONSE.ERROR_MISSING_PROPERTY);
            }

            var UserModel = req.vsc.db.model(dbModels.userModel);
            UserModel.findOne({ username: email })
                .exec(function (err, user) {
                    if (err) {
                        return restHelper.unexpectedError(res, err);
                    }
                    else if (user == undefined) {
                        return restHelper.OK(res, {});
                    }

                    req.vsc.loginCred = user;
                    next();
                });
        },
        /**
         * Generates a new reset password token and the token's expired date.'
         * @param  {Object} req
         * @param  {Object} res
         * @param  {Object} next
         */
        function generateToken(req, res, next) {
            var token = req.vsc.token = keygen.session_id({ length: 64 });
            var loginCred = req.vsc.loginCred;
            
            loginCred.update({ resetPasswordToken: token, resetPasswordExpires: Date.now() + expirationTime },{_editor: loginCred._id},
                function (err, updateStatistics) {
                    if (err) {
                        return restHelper.unexpectedError(res, err);
                    }
                    else if (updateStatistics == undefined) {
                        return restHelper.OK(res, {});
                    }
                    req.vsc.loginCred.resetPasswordToken = token;
                    next();
                });
        },
        /**
         * Send a mail with further information how to reset password based on 
         * the token we have created. 
         * @param  {Object} req
         * @param  {Object} res
         * @param  {Object} next
         */
        function sendMail(req, res, next) {
            var receiver = req.vsc.loginCred.username;
            var subject = STRINGS.HEADER_SUBJECT;
            var token = req.vsc.loginCred.resetPasswordToken;

            fs.readFile(Storage.LookupPath + PATH_FORGOT_PASSWORD, function (err, data) {
                if (err) {
                    req.logger.error(err);
                    return cb(err);
                }

                var body = data.toString().replace(/{token}/g, token );

                forgotPwdMailSender.sendMailTo(receiver, subject, body, function (err, info) {
                    if (err) {
                        req.logger.error(STRINGS.ERROR_FAILED_SEND_EMAIL + receiver + " \r\n" + err.message);
                    }
                });

                next();
            });
        },
        /**
         * Everything went good. Send a OK message back to the user.
         * @param  {Object} req
         * @param  {Object} res
         */
        function sendOkRespond(req, res) {
            restHelper.OK(res, {});
        }
    ];
}