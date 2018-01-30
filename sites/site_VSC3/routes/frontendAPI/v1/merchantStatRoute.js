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
    Router.get('/v1/merchantstat', getMerchantStat());
};

function getMerchantStat() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,               
        config,        
        getDeals,
        getDownloads,
        FetchMechants,
        format
    ]
}

function config(req, res, next) {
    var user = req.user;
    req.yoz.result = {
        total_balance : 0,
        total_deals : 0,
        total_downloads : 0,
        active_deals: 0,
        inactive_deals :0
    }    
    req.yoz.query = {};
    req.yoz.query._id = user.merchant
    req.yoz.condition = {};
    next();
};

function getDeals(req, res, next) {
    var user = req.user;
    var DealModel = req.yoz.db.model(dbModels.dealModel);
    var query = { merchantId : user.merchant};   
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
    var user = req.user;
    var DownloadDeal = req.yoz.db.model(dbModels.downloadDealModel);
    var query = { merchantId : user.merchant};   
    DownloadDeal.find(query, {}, req.yoz.condition).
    exec(function(err, download) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }        
        req.yoz.downloadDealObj = download;        
        next();
    });
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
