'use strict'
var passport = require('../../../controllers/passport');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var async = require("async");
var Config = require('../../../config');
var mongoose = require('mongoose');
var activityLogg = require('../../../util/activityLogg');
var voucher_codes = require('voucher-code-generator');
var expirationTime = Config.constants.expirationTime || 3600000;

const STRINGS = {

}

const USER_RESPONSE = {
    TOKEN_ALREADY_DOWNLOADED: "Sorry. You have already downloaded this coupon today. Please try again tomorrow."
};

module.exports.use = function(Router) {
    Router.get('/v1/downloaddeal/:merchantId', getAllDownloadDeal());
    Router.post('/v1/downloaddeal/create', createDownloadDeal());
};

function getAllDownloadDeal() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        validateMandatoryParam,
        checkUserAccess,
        queryPageing,
        fetchDeals,
        format
    ];
};

function createDownloadDeal() {
    return [
        config,
        checkDealValid,
        chechDealPerUserAndExpires,
        checkOneTimeLoginExpires,
        validateDownloadDeal,
        saveDownloadDeal,
        format
    ];
};

function config(req, res, next) {
    req.yoz.query = {};
    req.yoz.condition = {};
    next();
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

function validateMandatoryParam(req, res, next) {
    var merchantId = req.params.merchantId;
    if (merchantId == undefined || merchantId == '') {
        return restHelper.badRequest(res, 'merchantId is missing');
    } else {
        req.yoz.query.merchantId = merchantId;
        next();
    }
};

function checkUserAccess(req, res, next) {
    var user = req.user;
    var Types = req.yoz.db.Schemas[dbModels.roleModel].Types;

    if (user.roleId.equals(Types.SuperAdminRole) || user.roleId.equals(Types.MerchantAdminRole)) {
        return next();
    } else if (user.roleId.equals(Types.MerchantRole)) {
        var merchantId = req.params.merchantId;
        if (user.merchant.equals(merchantId)) {
            return next();
        } else {
            return restHelper.accessDenied(res);
        }
    } else {
        return restHelper.unAuthorized(res, USER_RESPONSE.UPDATE_CLINIC_UNAUTHORIZED);
    }
};

function fetchDeals(req, res, next) {
    var DownloadDeal = req.yoz.db.model(dbModels.downloadDealModel);
    var query = req.yoz.query;

    DownloadDeal.find(query, {}, req.yoz.condition).
    exec(function(err, downloadDeals) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (downloadDeals == undefined || downloadDeals.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.downloadDealsObj = downloadDeals;
        next();
    });
};

function format(req, res) {
    var dealInfo = req.yoz.downloadDealsObj;
    for (var index = 0; index < dealInfo.length; index++) {
        var element = dealInfo[index];
        element.__v = undefined;
    }

    if (dealInfo.length == 1) {
        dealInfo[0].__v = undefined;
        dealInfo = dealInfo[0];
    }
    restHelper.OK(res, dealInfo);
};

function checkDealValid(req, res, next){
    var dealId = req.body.dealId;
    var DealModel = req.yoz.db.model(dbModels.dealModel);
    DealModel.findOne({"_id":dealId}).
    exec(function(err, deals) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (deals == undefined) {
            return restHelper.badRequest(res, 'Invalid deal Id!');
        }
        req.yoz.dealsObj = deals;
        next();
    });
};

function chechDealPerUserAndExpires(req, res, next){
    var downloadDeal = req.body;
    var DownloadDeal = req.yoz.db.model(dbModels.downloadDealModel);
    var query = {
        "dealId": downloadDeal.dealId,
        "contactNumber": downloadDeal.contactNumber
    };
    DownloadDeal.find(query, {}).
    exec(function(err, downloadDeals) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (downloadDeals == undefined || downloadDeals.length == 0) {
            next();
        }else{
            req.yoz.downloadDealList = downloadDeals;
            next()
        }        
    });
}

function checkOneTimeLoginExpires(req, res, next) {
    var user = req.yoz.downloadDealList;
    if(user){
        if (user[0].oneTimeExpires > new Date()) {
            return restHelper.conflict(res, USER_RESPONSE.TOKEN_ALREADY_DOWNLOADED);
        }else{
            next();
        }
    }else{
        next();
    }
};

function validateDownloadDeal(req, res, next) {
    var downloadDeal = req.body;
    var coupan = voucher_codes.generate({
        length: 6,
        count: 1,
        charset: voucher_codes.charset("alphabetic")
    });
    downloadDeal.merchantId = req.yoz.dealsObj.merchantId;
    downloadDeal.dealName = req.yoz.dealsObj.name;
    downloadDeal.couponCode = coupan[0];
    downloadDeal.oneTimeExpires = Date.now() + expirationTime;
    var DownloadDealModel = req.yoz.db.model(dbModels.downloadDealModel);
    var downloadDealObject = new DownloadDealModel(downloadDeal);
    var err = downloadDealObject.validateSync();
    if (err) {
        return restHelper.badRequest(res, err);
    } else {
        req.yoz.downloadDealsObj = downloadDealObject;
        next();
    }
};

function saveDownloadDeal(req, res, next){
    var downloadDealsObj = req.yoz.downloadDealsObj;    
    downloadDealsObj.save(function(err, nData){
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        var nObj = [];
            nObj.push(nData);
        req.yoz.downloadDealsObj = nObj;
        next();
    });
};