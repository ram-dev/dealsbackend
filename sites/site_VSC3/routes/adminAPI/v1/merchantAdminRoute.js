'use strict'
var passport = require('../../../controllers/passport');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var async = require("async");
var Config = require('../../../config');
var mongoose = require('mongoose');
var activityLogg = require('../../../util/activityLogg');
var fs =require('fs')
const ACCOUNT_TRANSACTION_TYPE_ADD = "Added";
const ACCOUNT_TRANSACTION_STATUS_SUCCESS = "Sucess";

const STRINGS = {

}

const USER_RESPONSE = {
    UPDATE_CLINIC_UNAUTHORIZED: "Unauthorized",
    STATUS_OK: "OK"
};

module.exports.use = function(Router) {

    Router.get('/v1/merchant', getMerchant());
    Router.get('/v1/merchant/:merchantId', getMerchant());
    Router.post('/v1/merchant/addamount/:merchantId', addAmountMerchant());     

};

function getMerchant() {
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        CheckUserAccess,
        config,
        queryPageing,
        queryRestrictionForMerchant,
        queryRestrictToFetchMerchant,
        FetchMechants,
        format
    ]
}


function addAmountMerchant(){
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        function(req, res, next) {
            var merchantId = req.params.merchantId;
            if (merchantId === undefined) {
                return restHelper.badRequest(res, 'merchantId is missing');
            }
            next();
        },
        CheckUserAccess,
        function validateMandatoryParams(req, res, next){
            var merchant = req.body;
            if(merchant.amount == undefined){
                return restHelper.badRequest(res, 'please enter amount');
            }else{
                next();
            }
        },
        fetchMechant,
        function saveMarchant(req, res) {
            var user = req.user;    
            var amount = parseFloat(req.yoz.merchantObj.amount) + parseFloat(req.body.amount);            
            req.yoz.merchantObj.amount = amount;
            req.yoz.merchantObj.updated_by = user._id;
            req.yoz.merchantObj._editor = user._id;                     
            var merchantObj = req.yoz.merchantObj; 
            var AccountModel = req.yoz.db.model(dbModels.accountModel);
            var amountBody = {};
            amountBody.amount = req.body.amount;
            amountBody.type = ACCOUNT_TRANSACTION_TYPE_ADD;
            amountBody.status = ACCOUNT_TRANSACTION_STATUS_SUCCESS;
            amountBody.merchantId = merchantObj._id;
            amountBody.userId = user._id;
            amountBody.paymentinfo = req.body.paymentinfo;             
            var accountObj = new AccountModel(amountBody);
            accountObj.updated_by = user._id;
            accountObj._editor = user._id;
            merchantObj.save(function(err) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                accountObj.save(function(err, newAccount) {
                    if (err) {
                        return restHelper.unexpectedError(res, err);
                    }else{
                        return res.status(200).json(newAccount);
                    }                
                });
                //return res.status(200).json({'status':'OK'});
            });
        }
    ]
}




function config(req, res, next) {
    req.yoz.query = {};
    req.yoz.condition = {};
    next();
};

 function fetchMechant(req, res, next){
            var MerchantModel = req.yoz.db.model(dbModels.merchantModel);
            MerchantModel.findOne({_id: req.params.merchantId}, function (err, merchantDetails) {
                if(err){
                    return restHelper.unexpectedError(res, err); 
                }
                req.yoz.merchantObj = merchantDetails;
                next();
            })
            
        };

function queryPageing(req, res, next) {
    if (req.query.skip != undefined) {
        req.yoz.condition.skip = Number(req.query.skip);
    }
    if (req.query.limit != undefined) {
        req.yoz.condition.limit = Number(req.query.limit);
    }
    if (req.query.sortBy != undefined) {
        req.yoz.condition.sort = req.query.sortBy;
    }

    next();
};

function queryRestrictToFetchMerchant(req, res, next) {
    var userInfoId = req.params.merchantId;
    if (userInfoId === undefined) {
        return next();
    }
    req.yoz.query._id = userInfoId;
    next();
};

function FetchMechants(req, res, next) {
    var MerchantModel = req.yoz.db.model(dbModels.merchantModel);
    var query = req.yoz.query;   
    MerchantModel.find(query, {}, req.yoz.condition)
    .populate('userId')
    .populate('categoryId')
    .exec(function(err, user) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }        
        req.yoz.userInfoObj = user;
        next();
    });
};

function formatimg(req, res) {
    var userInfo = req.yoz.userInfoObj;    
    res.end(restHelper.OK(res, userInfo));
};

function format(req, res) {
    var userInfo = req.yoz.userInfoObj;
    for (var index = 0; index < userInfo.length; index++) {
        var element = userInfo[index];
        element.__v = undefined;
        element.updated_by = undefined;
        element.created_By = undefined;
        element.userId.password = undefined;
        element.userId.__v = undefined;
        element.userId.isManual = undefined;
        element.userId.locked = undefined;
        element.userId.loginAtempts = undefined;
        element.userId.deleted = undefined;
        element.userId.resetPasswordToken = undefined;
        element.userId.resetPasswordExpires = undefined;
        element.userId.oneTimeToken = undefined;
        element.userId.oneTimeExpires = undefined;
        element.userId.created = undefined;
        element.userId.updated = undefined;
    }

    if (userInfo.length == 1) {
        userInfo[0].__v = undefined;
        userInfo[0].updated_by = undefined;
        userInfo[0].created_By = undefined;
        userInfo = userInfo[0];
    }
    restHelper.OK(res, userInfo);
};

function queryRestrictionForMerchant(req, res, next) {
    var user = req.user;
    var Types = req.yoz.db.Schemas[dbModels.roleModel].Types;

    if (user.roleId.equals(Types.SuperAdminRole)) {
        return next();
    } else {
        req.yoz.query.userId = user._id;
    }
    next();
};

function CheckUserAccess(req, res, next) {    
    var user = req.user;   
    var Types = req.yoz.db.Schemas[dbModels.roleModel].Types;

    if (user.roleId.equals(Types.SuperAdminRole) || user.roleId.equals(Types.MerchantAdminRole)) {
        return next();
    } else if (user.roleId.equals(Types.MerchantRole)) {

        var merchantId = req.params.merchantId;
        if (user.merchant.equals(merchantId)) {
            return next();
        }
        return restHelper.accessDenied(res);
    } else {
        return restHelper.unAuthorized(res, USER_RESPONSE.UPDATE_CLINIC_UNAUTHORIZED);
    }
};

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


