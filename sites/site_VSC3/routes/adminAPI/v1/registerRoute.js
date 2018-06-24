var keygen = require("keygenerator");
var async = require('async');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var Config = require('../../../config');
var moment = require('moment');
var sendInviteMailSender = require('../../../util/emailVerificationMailSender');
var fs = require('fs');
var Storage = require(__base).Storage;

const HEADER_SUBJECT = "YofferZ - One time login link";
var expirationTime = Config.constants.expirationTime || 3600000;

const STRINGS = {
    INFO_MERCHANT_CREATE_RESPONSE: "YofferZ - Create merchant API - Response - %j",
    FAIL_SEND_ONE_TIME_LINK_EMAIL: "Failed to send One-Time link email to ",
    FAIL_SEND_WECOME_EMAIL:"Failed to send welcome email to ",
    ERROR: "error",
    NEW_LINE: " \r\n",
    INFO_CLINICIAN_FIRST_UPADATE_RESPONSE :"YofferZ - Verify Email API - response - %j",
}

const USER_RESPONSE = {
    ERROR_LOGIN_ACCOUNT_LOCKED: "Account is locked",
    ERROR_PASSWORD_MISSING: "Password and confirm password is mandatory",
    ERROR_PASSWORD_NOT_MATCH: " password and Confirm password does not match",
    ERROR_FIELD_REQUIRED: "All fields are required",
    ERROR_UNABLE_TO_UPDATE_ONE_TIME_TOKEN_OF_USER: "--- Unable to update oneTimeToken of user, received: ",
    VERIFY_TOKEN_ERROR : "Could not find login credentials with one-time login token ",
    VERIFY_TOKEN_ERROR_EXPIRED :"You have tried to use a one-time login link that has expired. Please request a new link to system admin.",
}
module.exports.use = function(Router) {
    Router.post('/v1/register', RegisterMerchant());
    Router.get('/v1/verifyemail/:tokenId', VerifyMerchant());
};

function RegisterMerchant() {
    return [
        checkmandatoryParams,
        validateUser,
        validateMerchant,        
        saveMerchant,
        saveUser,
        generateToken,
        sendMail,
        sendOkRespond
    ]
}

function VerifyMerchant() {
    return [
        function(req, res, next) {            
            var token = req.params.token;
            if (token == '') {
                return restHelper.badRequest(res, "token is required");
            }
            req.yoz.token = token;
            next();
        },
        verifyUserByOneTimeToken,
        checkOneTimeLoginExpires,
        sendWelcomeMail,
        savefirstTime
    ]
}

function verifyUserByOneTimeToken(req, res, next) {
    var token = req.params.tokenId;
    var UserModel = req.yoz.db.model(dbModels.userModel);
    UserModel.findOne({ oneTimeToken: token }, function(err, user) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (user == undefined) {
            return restHelper.notFound(res, USER_RESPONSE.VERIFY_TOKEN_ERROR);
        }
        req.yoz.merchant = user;
        next();
    });
};

function sendWelcomeMail(req, res, next) {
    var receiver = req.yoz.merchant.username;
    var name = req.yoz.merchant.firstName + ' ' + req.yoz.merchant.lastName;
    var subject = "Welcome to YofferZ";
   
    fs.readFile(Storage.LookupPath + '/Welcome.xml', function(err, data) {
        if (err) {
            req.logger.error(err);
            return cb(err);
        }

        var body = data.toString()            
            .replace(/{url}/g, Config.inviteLinkUrl)
            .replace(/{receiver}/g, receiver)
            .replace(/{username}/g, name)
            .replace(/{replay}/g, Config.infomail);

        async.waterfall([
            function(callback) {
                if (Config.debug) {
                    callback();
                } else {
                    sendInviteMailSender.sendMailTo(receiver, subject, body, function(err, info) {
                        if (err) {
                            req.logger.log(STRINGS.ERROR, STRINGS.FAIL_SEND_WECOME_EMAIL + receiver + STRINGS.NEW_LINE + err.message);
                            callback(err);
                        } else {
                            callback(null, info);
                        }
                    });
                }
            },
        ], function(err, result) {
            if (err) {
                return restHelper.unexpectedError(res, err);
            }
            next();
        });
    });
}
function savefirstTime(req, res, next) {
    var userInfoObj = req.yoz.merchant;
    if (userInfoObj.contacts == undefined) {
        userInfoObj.contacts = {};
    }
    addParameters(userInfoObj, req.body);
    userInfoObj.oneTimeExpires = undefined;
    userInfoObj.oneTimeToken = undefined;
    userInfoObj._omitLog = true;
    userInfoObj.save(function(err, userObj) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        req.logger.info(STRINGS.INFO_CLINICIAN_FIRST_UPADATE_RESPONSE, { "status": "OK" });
        restHelper.OK(res, { "status": "OK" });
    });
}

function addParameters(dbObj, restObj) {
    var result = {};
    for (var property in restObj) {
        if (restObj[property] instanceof Object) {
            result[property] = addParameters(dbObj[property], restObj[property]);
        }
        else {
            result[property] = dbObj[property];
            dbObj[property] = restObj[property];
        }
    }
    return result;
};

function checkOneTimeLoginExpires(req, res, next) {
    var user = req.yoz.merchant;
    if (user.oneTimeExpires < new Date()) {
        return restHelper.conflict(res, USER_RESPONSE.VERIFY_TOKEN_ERROR_EXPIRED);
    }
    req.yoz.merchant = user;
    next();
};


function checkmandatoryParams(req, res, next) {    
    var username = req.body.username || '';
    var password = req.body.password || '';
    var confirmpassword = req.body.confirmpassword || '';
    var categoryId = req.body.categoryId || '';
    var companyname = req.body.companyname || '';
    var firstName = req.body.firstName || '';
    var lastName = req.body.lastName || '';
    var contactNumber = req.body.contactNumber || '';

    username = username.toLowerCase();

    if (username == '' || categoryId == '' || companyname == '' || firstName == '' || lastName == '' || contactNumber == '') {
        return restHelper.badRequest(res, USER_RESPONSE.ERROR_FIELD_REQUIRED);
    }

    if (password == '' || confirmpassword == '') {
        return restHelper.badRequest(res, USER_RESPONSE.ERROR_PASSWORD_MISSING);
    }

    if (password != confirmpassword) {
        return restHelper.badRequest(res, USER_RESPONSE.ERROR_PASSWORD_NOT_MATCH);
    }

    next();
};

function validateUser(req, res, next) {
    var user = {};
    var RoleTypes = req.yoz.db.Schemas[dbModels.roleModel].Types;
    user.username = req.body.username;
    user.password = req.body.password;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.roleId = RoleTypes.MerchantRole
    user.contacts = {};
    user.contacts.phone1 = req.body.contactNumber;

    var merchantUserModel = req.yoz.db.model(dbModels.userModel);
    var merchant = new merchantUserModel(user);

    var err = merchant.validateSync();

    if (err) {
        return restHelper.badRequest(res, err);
    } else {
        req.yoz.user = merchant;
        next();
    }
}

function validateMerchant(req, res, next) {
    var merchant = {};
    merchant.name = req.body.companyname;
    merchant.categoryId = [];
    merchant.categoryId.push(req.body.categoryId);
    merchant.userId = req.yoz.user._id;
    var merchantModel = req.yoz.db.model(dbModels.merchantModel);
    var merchantObject = new merchantModel(merchant);

    var err = merchantObject.validateSync();

    if (err) {
        return restHelper.badRequest(res, err);
    } else {
        req.yoz.merchant = merchantObject;
        next();
    }
}

function saveUser(req, res, next) {
    var usermerchant = req.yoz.user;
    usermerchant.created_By = req.yoz.user._id;
    usermerchant._editor = req.yoz.user._id;
    usermerchant.merchant = req.yoz.merchant._id;
    usermerchant.save(function(err, newMerchant) {
        if (err) {
            var vendor =  req.yoz.newMerchant;
            vendor.remove();
            return restHelper.unexpectedError(res, err);
        }
        req.yoz.newUser = newMerchant;
        next();
    });
}

function saveMerchant(req, res, next) {
    var merchant = req.yoz.merchant;
    merchant._editor = req.yoz.user;
    merchant.created_By = req.yoz.user._id;
    merchant.updated_by = req.yoz.user._id;
    merchant._omitLog = true;
    merchant.save(function(err, newMerchant) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        req.yoz.newMerchant = newMerchant;
        next();
    });
}

function generateToken(req, res, next) {
    var token = req.yoz.token = keygen.session_id({ length: 64 });
    var newUser = req.yoz.newUser;
    newUser.update({ oneTimeToken: token, oneTimeExpires: Date.now() + expirationTime }, { _editor: req.yoz.user._id },
        function(err, updateResponse) {
            if (err) {
                return restHelper.unexpectedError(res, err);
            } else if (updateResponse.n != 1 || updateResponse.nModified != 1 || updateResponse.ok != 1) {
                var err = new Error(USER_RESPONSE.ERROR_UNABLE_TO_UPDATE_ONE_TIME_TOKEN_OF_USER + updateResponse);
                return restHelper.unexpectedError(res, err);
            }
            req.yoz.newUser.oneTimeToken = token;
            next();
        }
    );
}

function sendMail(req, res, next) {
    var receiver = req.yoz.newUser.username;
    var name = req.yoz.newUser.firstName + ' ' + req.yoz.newUser.lastName;
    var subject = HEADER_SUBJECT;
    var token = req.yoz.newUser.oneTimeToken;

    fs.readFile(Storage.LookupPath + '/EmailVerification.xml', function(err, data) {
        if (err) {
            req.logger.error(err);
            return cb(err);
        }

        var body = data.toString()
            .replace(/{token}/g, token)
            .replace(/{url}/g, Config.inviteLinkUrl)
            .replace(/{receiver}/g, receiver)
            .replace(/{username}/g, name)
            .replace(/{replay}/g, Config.infomail);

        async.waterfall([
            function(callback) {
                if (Config.debug) {
                    callback();
                } else {
                    sendInviteMailSender.sendMailTo(receiver, subject, body, function(err, info) {
                        if (err) {
                            req.logger.log(STRINGS.ERROR, STRINGS.FAIL_SEND_ONE_TIME_LINK_EMAIL + receiver + STRINGS.NEW_LINE + err.message);
                            callback(err);
                        } else {
                            callback(null, info);
                        }
                    });
                }
            },
        ], function(err, result) {
            if (err) {
                return restHelper.unexpectedError(res, err);
            }
            next();
        });
    });
}

function sendOkRespond(req, res) {
    req.logger.info(STRINGS.INFO_MERCHANT_CREATE_RESPONSE, { "status": "OK" });
    restHelper.OK(res, { "status": "OK" });
}