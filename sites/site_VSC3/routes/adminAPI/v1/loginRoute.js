var keygen = require("keygenerator");
var async = require('async');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var Config = require('../../../config');
var moment = require('moment');


const LOCK_TIME = Config.constants.lockTime ||  15;
const LOGIN_ATEMPTS = Config.constants.loginAtempts ||  5;
const DELETED_STATUS = false
const STRINGS = {
    DEBUG_LOGIN_USERNAME: "Username is ",
    INFO_LOGIN_REQUEST_USER: "Request for getUser: %j",
    DEBUG_LOGIN_RESPONSE_USER: "Response for getUser: %s",
    DEBUG_LOGIN_USER_LOCKED: "User is locked",
    DEBUG_LOGIN_USER_LOCKDOWN_EXPIRED: "Lockdown time expired, unlocking the user",
    DEBUG_LOGIN_USER_NOT_LOCKED: "User is not locked",
    DEBUG_LOGIN_FAILED_TO_LOGIN_X_TIMES: "User has failed to login %s times",
    DEBUG_LOGIN_USER_LOCK_ACCOUNT: "Locking the account",
    WARN_COULD_NOT_SAVE_LOGIN_ATEMPTS_WILL_NOT_BE_LOCKED_AFTER_X_ATTEMPTS: "Could not save log-in attempts. This could result in user will not be locked after X atempts ",
    WARN_COULD_NOT_SAVE_LOGIN_ATTEMPTS_CAN_RESULT_IN_USER_NOT_BEING_UNLOCKED: "Could not save log-in attempts. This could result in user will not be unlocked ",
    INFO_LOGIN_USER_RESPONSE: "Login User response : %j",
    MINUTE: "m",
}

const USER_RESPONSE = {
    ERROR_LOGIN_ACCOUNT_LOCKED: "Account is locked"
}
module.exports.use = function(Router) {
    Router.post('/v1/adminlogin', Post());
};

/**
 * Creates a chain of rules for the request to go through.
 *  
 * @return a array of rules to set on the route.
 */
function Post() {
    return [
        checkParams,
        getUser,
        checkIfUserIsLocked,
        validatePassword,
        loginUser,
        populateResult
    ]
}

function checkParams(req, res, next) {
    req.body.username = req.body.email
    var username = req.body.username || '';
    var password = req.body.password || '';
    username = username.toLowerCase();

    if (username == '' || password == '') {
        return restHelper.wrongUsernameOrPassword(res);
    }

    next();
};

function getUser(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var UserModel = req.yoz.db.model(dbModels.userModel);
    req.logger.debug(STRINGS.DEBUG_LOGIN_USERNAME + username);
    var query = { username: username, deleted: DELETED_STATUS };

    req.logger.info(STRINGS.INFO_LOGIN_REQUEST_USER, query);
    UserModel.findOne(query).
    populate("roleId").
    exec(function(err, user) {
        if (err) {
            restHelper.unexpectedError(res, err);
            return;
        } else if (!user) {
            restHelper.wrongUsernameOrPassword(res);
            return;
        } else {
            req.logger.debug(STRINGS.DEBUG_LOGIN_RESPONSE_USER, user.username);
            user._editor = user;
            req.yoz.user = user;
            next();
        }
    });
};

function checkIfUserIsLocked(req, res, next) {
    var user = req.yoz.user;
    if (user.locked === true) {
        req.logger.debug(STRINGS.DEBUG_LOGIN_USER_LOCKED);
        if (moment(user.lockDate).add(LOCK_TIME, STRINGS.MINUTE) < new Date()) {
            req.logger.debug(STRINGS.DEBUG_LOGIN_USER_LOCKDOWN_EXPIRED);
            user.locked = false;
            user.lockDate = undefined;
            next();
        } else {
            restHelper.accessDenied(res, USER_RESPONSE.ERROR_LOGIN_ACCOUNT_LOCKED);
            return;
        }
    } else {
        req.logger.debug(STRINGS.DEBUG_LOGIN_USER_NOT_LOCKED);
        next();
    }
};

function validatePassword(req, res, next) {
    var user = req.yoz.user;
    var password = req.body.password;
    // Make sure the password is correct
    user.verifyPassword(password, function(err, isMatch) {
        if (err) {
            restHelper.unexpectedError(res, err);
            return;
        }

        // Password did not match
        if (!isMatch) {
            user.loginAtempts++;
            req.logger.debug(STRINGS.DEBUG_LOGIN_FAILED_TO_LOGIN_X_TIMES, user.loginAtempts);
            if (user.loginAtempts == LOGIN_ATEMPTS) {
                req.logger.debug(STRINGS.DEBUG_LOGIN_USER_LOCK_ACCOUNT);
                user.locked = true;
                user.lockDate = new Date();
            }
            user.save(function(err) {
                if (err) {
                    req.logger.warn(STRINGS.WARN_COULD_NOT_SAVE_LOGIN_ATEMPTS_WILL_NOT_BE_LOCKED_AFTER_X_ATTEMPTS + err.message);
                }
                return restHelper.wrongUsernameOrPassword(res);
            });

            return;
        } else {
            user.loginAtempts = 0;
            user.save(function(err) {
                if (err) {
                    req.logger.warn(STRINGS.WARN_COULD_NOT_SAVE_LOGIN_ATTEMPTS_CAN_RESULT_IN_USER_NOT_BEING_UNLOCKED + err.message);
                }
            });
        }

        next();
    });
};

function loginUserIsMerchant(req, res, next) {
    var user = req.yoz.user;
    
    var RoleTypes = req.yoz.db.Schemas[dbModels.roleModel].Types;
    if (user.roleId._id.toString() === RoleTypes.MerchantRole) {
        if (Config.debug) {
            next();
        }else{
            if(user.oneTimeToken == undefined){
                next();
            }else{
                return restHelper.badRequest(res, "pending email verification");
            }
        }        
    } else {
        restHelper.wrongUsernameOrPassword(res);
    }
};

function loginUser(req, res, next) {
    var user = req.yoz.user;

    var TokenModel = req.yoz.db.model(dbModels.tokenModel);

    TokenModel.findOne({ userId: user._id }, function(err, token) {
        if (err) {
            restHelper.wrongUsernameOrPassword(res);
            return;
        }

        if (!token) {
            var newtoken = keygen.session_id();

            var newToken = new TokenModel({
                value: newtoken,
                userIp: req.connection.remoteAddress,
                userId: user._id
            });

            newToken.save(function(err) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                req.yoz.token = newtoken;
                next();
            });
        } else {
            var condition = { _id: token._id },
                update = {
                    value: keygen.session_id()
                },
                options = {};
            TokenModel.update(condition, update, options, function(err, raw) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                req.yoz.token = update.value;
                next();
            });
        }
    });
};

function populateResult(req, res) {
    var user = req.yoz.user;
    var token = req.yoz.token;
    var response = {}
    response._id = user._id;
    response.username = user.username;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.contacts = user.contacts;
    response.clinic = user.clinic;
    response.avatar = user.avatar;
    response.role = user.roleId;
    response.ssn = user.ssn;
    response.token = token;
    req.logger.info(STRINGS.INFO_LOGIN_USER_RESPONSE, response);
    return res.status(200).json(response);
}