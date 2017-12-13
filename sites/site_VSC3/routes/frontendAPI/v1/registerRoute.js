var keygen = require("keygenerator");
var async = require('async');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var Config = require('../../../config');
var moment = require('moment');
var sendInviteMailSender = require('../../../util/forgotPwdMailSender');
var fs = require('fs');
var Storage = require(__base).Storage;

const HEADER_SUBJECT = "YofferZ - One time login link";
var expirationTime = Config.constants.expirationTime || 3600000;

const STRINGS = {
    INFO_MERCHANT_CREATE_RESPONSE: "YofferZ - Create merchant API - Response - %j",
    FAIL_SEND_ONE_TIME_LINK_EMAIL: "Failed to send One-Time link email to " ,
    ERROR: "error",    
    NEW_LINE: " \r\n",
}

const USER_RESPONSE = {
    ERROR_LOGIN_ACCOUNT_LOCKED: "Account is locked",
    ERROR_PASSWORD_MISSING:"Password and confirm password is mandatory",
    ERROR_PASSWORD_NOT_MATCH:" password and Confirm password does not match",
    ERROR_FIELD_REQUIRED: "Field is required",
    ERROR_UNABLE_TO_UPDATE_ONE_TIME_TOKEN_OF_USER: "--- Unable to update oneTimeToken of user, received: ",
}
module.exports.use = function(Router) {
    Router.post('/v1/register', RegisterMerchant());    
};

function RegisterMerchant() {
    return [
        checkmandatoryParams,
        validateMerchant,
        validateUser,        
        saveMerchant,
        saveUser,
        generateToken,
        sendMail,
        sendOkRespond
    ]
}

function checkmandatoryParams(req, res, next) {
    req.yoz = {}
    var username = req.body.username || '';
    var password = req.body.password || '';
    var confirmpassword = req.body.confirmpassword || '';
    var categoryId = req.body.categoryId || '';
    var companyname = req.body.companyname || '';
    var firstName = req.body.firstName || '';
    var lastName = req.body.lastName || '';
    var contactNumber = req.body.contactNumber || '';

    username = username.toLowerCase();

    if(username == '' || categoryId == '' || companyname == '' || firstName == '' || lastName == '' || contactNumber == '' ){
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

function validateUser(req, res, next){
    var user = {};   
    var RoleTypes = req.vsc.db.Schemas[dbModels.roleModel].Types;
    user.username = req.body.username;
    user.password = req.body.password;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.roleId = RoleTypes.MerchantRole
    user.contacts = {};
    user.contacts.phone1 = req.body.contactNumber;

    var merchantUserModel = req.vsc.db.model(dbModels.userModel);
    var merchant = new merchantUserModel(user);

    var err = merchant.validateSync();

    if (err) {
        return restHelper.badRequest(res, err);
    }
    else {
        req.yoz.user = merchant;
        next();
    }    
}

function validateMerchant(req, res, next){
    var merchant = {};
    merchant.name = req.body.companyname;
    merchant.categories =[];
    merchant.categories.push(req.body.categoryId);

    var merchantModel = req.vsc.db.model(dbModels.merchantModel);
    var merchantObject = new merchantModel(merchant);

    var err = merchantObject.validateSync();

    if (err) {
        return restHelper.badRequest(res, err);
    }
    else {
        req.yoz.merchant = merchantObject;
        next();
    }
}

function saveUser(req, res, next){
    var usermerchant = req.yoz.user;
    usermerchant.created_By = req.yoz.user._id;
    usermerchant._editor = req.yoz.user._id
    usermerchant.save(function (err, newMerchant) {
        if (err) {
            return restHelper.unexpectedError(res, err);                   
        }
        req.yoz.newUser = newMerchant;
        next();
    });
}

function saveMerchant(req, res, next){
    var merchant = req.yoz.merchant;
    merchant.created_By = req.yoz.user._id;   
    merchant.updated_by = req.yoz.user._id;    
    merchant.save(function (err, newMerchant) {
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
        function (err, updateResponse) {
            if (err) {
                return restHelper.unexpectedError(res, err);
            }
            else if (updateResponse.n != 1 || updateResponse.nModified != 1 || updateResponse.ok != 1) {
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
    var subject = HEADER_SUBJECT;
    var token = req.yoz.newUser.oneTimeToken;

    fs.readFile(Storage.LookupPath + '/OneTimeRegistrationBody.xml', function (err, data) {
        if (err) {
            req.logger.error(err);
            return cb(err);
        }

        var body = data.toString()
            .replace(/{token}/g, token)
            .replace(/{url}/g, Config.inviteLinkUrl);

            async.waterfall([
                function(callback) {                        
                    if(Config.debug){
                        callback();
                    }else{
                        sendInviteMailSender.sendMailTo(receiver, subject, body, function (err, info) {                    
                            if (err) {
                                req.logger.log(STRINGS.ERROR, STRINGS.FAIL_SEND_ONE_TIME_LINK_EMAIL + receiver + STRINGS.NEW_LINE + err.message);
                                callback(err);
                            }else{
                                callback(null, info);
                            }                                     
                        });  
                    }                        
                },
            ],function (err, result) {                  
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                next(); 
            });
        }
    );
}

function sendOkRespond(req, res) {
    req.logger.info(STRINGS.INFO_MERCHANT_CREATE_RESPONSE, { "status": "OK" });
    restHelper.OK(res, { "status": "OK" });
}