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
    UPDATE_CLINIC_UNAUTHORIZED: "Unauthorized",
    STATUS_OK: "OK"
};

module.exports.use = function(Router) {    
    Router.get('/v1/merchantstat/:merchantId', getMerchantStat());
};

function getMerchantStat() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        CheckUserAccess,
        config,
        queryPageing,
        queryRestrictionForMerchant,
        queryRestrictToFetchMerchant,
        getDeals,
        getDownloads,
        FetchMechants,
        format
    ]
}

function config(req, res, next) {
    req.yoz.result = {
        total_balance : 0,
        total_deals : 0,
        total_downloads : 0,
        active_deals: 0,
        inactive_deals :0
    }
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
    MerchantModel.find(query, {}, req.yoz.condition).
    exec(function(err, user) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }        
        req.yoz.userInfoObj = user;
        next();
    });
};

function getDeals(req, res, next) {
    var DealModel = req.yoz.db.model(dbModels.dealModel);
    var query = { merchantId : req.params.merchantId};   
    DealModel.find(query, {}, req.yoz.condition).
    exec(function(err, deal) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }        
        req.yoz.dealObj = deal;        
        next();
    });
};

function getDownloads(req, res, next) {
    var DownloadDeal = req.yoz.db.model(dbModels.downloadDealModel);
    var query = { merchantId : req.params.merchantId};   
    DownloadDeal.find(query, {}, req.yoz.condition).
    exec(function(err, download) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }        
        req.yoz.downloadDealObj = download;        
        next();
    });
};

function format(req, res) {
    var userInfo = req.yoz.userInfoObj;    
    var download = req.yoz.downloadDealObj;
    var deal = req.yoz.dealObj;
    var activeDeals = [];
    var inactiveDeals = [];
    req.yoz.result.total_balance = userInfo[0].amount;
    req.yoz.result.total_downloads = download.length;
    req.yoz.result.total_deals = deal.length;
    for(var i = 0; i < deal.length ; i++ ){
        if(deal[i].status === false){
            inactiveDeals.push(deal[i]);
        }else{
            activeDeals.push(deal[i]);
        }
    }
    req.yoz.result.active_deals = activeDeals.length;
    req.yoz.result.inactive_deals = inactiveDeals.length;   
    restHelper.OK(res, req.yoz.result);

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


