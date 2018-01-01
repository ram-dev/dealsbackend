'use strict'
var passport = require('../../../controllers/passport');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var async = require("async");
var Config = require('../../../config');
var mongoose = require('mongoose');
var activityLogg = require('../../../util/activityLogg');

const STRINGS = {

}

const USER_RESPONSE = {

};

module.exports.use = function(Router) {
    Router.get('/v1/user', getCurrentUser());
    Router.get('/v1/user/:userID', getUser());
    Router.put('/v1/user/:userID', updateUser());
    Router.post('/v1/user/:userID/resetpwd', updateUserPassword());
};

function getCurrentUser(){
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        function(req, res, next){
            req.yoz.userObj = req.user;
            next();
        },
        format
    ]
}

function getUser() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        CheckUserAccess,
        fetchUser,
        format
    ];
}

function updateUser() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        CheckUserAccess,
        checkAccessRestrictedParams,
        fetchUser,
        updateUserDetails,
        format
    ];
}

function updateUserPassword() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        CheckUserAccess,
        validateResetPasswordParams,
        fetchUser,
        function verifyOldPassword(req, res, next) {
            var user = req.yoz.userObj;
            user.verifyPassword(req.body.oldpassword, function(err, isMatch) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                } else if (!isMatch) {
                    return restHelper.badRequest(res, 'oldpassword is invalid!');
                } else {
                	req.yoz.userObj.password = req.body.newpassword;
                    next();
                }
            });
        },
        updateUserDetails,
        format
    ];
}

function CheckUserAccess(req, res, next) {
    var user = req.user;
    var userID = req.params.userID;
    var Types = req.yoz.db.Schemas[dbModels.roleModel].Types;
    if (user.roleId.equals(Types.SuperAdminRole) || user.roleId.equals(Types.MerchantAdminRole)) {
        return next();
    } else if (user.roleId.equals(Types.MerchantRole)) {
        if (user._id.equals(userID)) {
            next();
        } else {
            return restHelper.accessDenied(res);
        }
    } else {
        return restHelper.unAuthorized(res, USER_RESPONSE.UPDATE_CLINIC_UNAUTHORIZED);
    }
};

function config(req, res, next) {
    req.yoz.query = {};
    req.yoz.condition = {};
    next();
};

function fetchUser(req, res, next) {
    req.yoz.query._id = req.params.userID;
    var UserModel = req.yoz.db.model(dbModels.userModel);
    var query = req.yoz.query;
    UserModel.findOne(query)
        .exec(function(err, UserData) {
            if (err) {
                return restHelper.unexpectedError(res, err);
            }
            req.yoz.userObj = UserData;
            next();
        });
};

function updateUserDetails(req, res, next) {
    var user = req.user;
    var userInfo = req.yoz.userObj;
    if (userInfo == undefined) {
        return restHelper.badRequest(res, 'User Not Found');
    }
    addParameters(userInfo, req.body);
    userInfo._editor = user;
    userInfo.save(function(err, UserData) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        req.yoz.userObj = UserData;
        next();
    });
};

function format(req, res) {
    var userInfo = req.yoz.userObj;
    if (userInfo == undefined) {
        return restHelper.badRequest(res, 'User Not Found');
    }
    userInfo.__v = undefined;
    userInfo.password = undefined;
    userInfo.resetPasswordToken = undefined;
    userInfo.resetPasswordExpires = undefined;
    userInfo.oneTimeToken = undefined;
    userInfo.oneTimeExpires = undefined;
    userInfo.deleted = undefined;
    userInfo.loginAtempts = undefined;
    userInfo.locked = undefined;
    userInfo.lockDate = undefined;
    userInfo.isManual = undefined;
    return restHelper.OK(res, userInfo);
};

function checkAccessRestrictedParams(req, res, next) {
    try {
        checkRestrictedParams(req.body);
    } catch (err) {
        return restHelper.accessDenied(res, err.message);
    }
    next();
};

function checkRestrictedParams(body) {
    for (var param in body) {
        if (param === "password") {
            throw new Error(param + " cannot be changed using this API");
        }
        if (param === "resetPasswordToken") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "resetPasswordExpires") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "oneTimeToken") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "oneTimeExpires") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "version") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "merchant") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "deleted") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "created") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "updated") {
            throw new Error(param + " cannot be changed");
        }
        if (param === "roleId") {
            throw new Error(param + " cannot be changed");
        }
    }
};

function addParameters(dbObj, restObj) {
    var result = {};
    for (var property in restObj) {
        if (restObj[property] instanceof Object) {
            result[property] = addParameters(dbObj[property], restObj[property]);
        } else {
            result[property] = dbObj[property];
            dbObj[property] = restObj[property];
        }
    }
    return result;
};

function validateResetPasswordParams(req, res, next) {
    var body = req.body;
    var oldpassword = body.oldpassword;
    var newpassword = body.newpassword;
    var confirmpassword = body.confirmpassword;
    if (oldpassword == '') {
        return restHelper.badRequest(res, 'oldpassword is required');
    }
    if (newpassword == '') {
        return restHelper.badRequest(res, 'newpassword is required');
    }
    if (confirmpassword == '') {
        return restHelper.badRequest(res, 'confirmpassword is required');
    }

    if (newpassword != confirmpassword) {
        return restHelper.badRequest(res, 'new and confirm password not matched!');
    }
    next();
}