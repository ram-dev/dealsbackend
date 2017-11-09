/** 
 * Reset Module Router
 * @version 1.0
 * ------------------------
 * This module handles the post request and reset the password to the new one.
 * This is based on a resetPassword token that need to be sent as the param in the request.
 * This token can be obtain be calling forgot password api 
 * 
 * Copyright © 2017 yofferz. All rights reserved.
 */

var dbModels = require('../../../util/dbModels');
var restHelper = require('../../../util/restHelper');

const STRINGS = {
    INFO_RESET_PASSWORD: "VSC-Reset password API - %s",
    ERROR_REMOVE_LOGINCRED: "Fail to remove login credentials for id %s"
}

const USER_RESPONSE ={
    ERROR_MISSING_PARAMS: "newpassword parameter missing in body",
    ERROR_NOTFIND_LOGINCRED: "Could not find login credentials with reset password token:",
    ERROR_TOKEN_EXPIRED: "Reset password token has expired.",
}

module.exports.use = function (Router) {
    Router.post('/v1/reset/:token', Post());
};
/**
 * a chain of steps to reset password.
 */
function Post() {
    return [
        function checkBodyParam(req, res, next) {
            var body = req.body;

            if (body.newpassword == undefined) {
                return restHelper.badRequest(res, USER_RESPONSE.ERROR_MISSING_PARAMS);
            }

            next();
        },
        function fetchUserByResetToken(req, res, next) {
            var token = req.params.token;

            var UserModel = req.vsc.db.model(dbModels.userModel);

            UserModel.findOne({ resetPasswordToken: token }, function (err, user) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }

                if (user == undefined) {
                    return restHelper.notFound(res, USER_RESPONSE.ERROR_NOTFIND_LOGINCRED + token);
                }

                req.vsc.user = user;
                next();
            });
        },
        function checkResetPasswordExpires(req, res, next) {
            var user = req.vsc.user;

            if (user.resetPasswordExpires < new Date()) {
                return restHelper.conflict(res, USER_RESPONSE.ERROR_TOKEN_EXPIRED);
            }

            return next();
        },
        function resetPassword(req, res, next) {
            var user = req.vsc.user;
            req.logger.info(STRINGS.INFO_RESET_PASSWORD, user.username);
            user.password = req.body.newpassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user._editor = user._id;
            user.save(function (err) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                next();
            });
        },
        function removeLoginToken(req, res, next) {
            var user = req.vsc.user;
            var TokenModel = req.vsc.db.model(dbModels.tokenModel);
            TokenModel.remove({ userId: user._id }, function (err) {
                if (err) {
                    req.logger.error(STRINGS.ERROR_REMOVE_LOGINCRED, user.username);
                }
            });

            restHelper.OK(res, {});
        }
    ];
}