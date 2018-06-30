'use strict'
var passport = require('../../../controllers/passport');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var async = require("async");
var Config = require('../../../config');
var mongoose = require('mongoose');
var activityLogg = require('../../../util/activityLogg');

const ACCOUNT_TRANSACTION_TYPE_REMOVED = "Paid";
const ACCOUNT_TRANSACTION_STATUS_SUCCESS = "Sucess";
const ACCOUNT_TRANSACTION_TYPE_ADD = "Added";

const STRINGS = {

}

const USER_RESPONSE = {

};

module.exports.use = function(Router) {
    Router.get('/v1/deal', getAllDeal());
    Router.get('/v1/deal/:dealId', getDealBydealID());
    Router.post('/v1/deal/:dealId/golive', goLiveDeal());    
};

function getAllDeal() {
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        config,
        CheckUserAccess,
        queryPageing,        
        fetchDeals,
        format
    ];
}

function getDealBydealID() {
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        config,        
        CheckUserAccess,
        queryPageing,        
        function filterDealById(req, res, next) {
            var dealId = req.params.dealId;
            if (dealId == undefined || dealId == '') {
                return restHelper.badRequest(res, 'dealId is missing');
            }
            req.yoz.query._id = dealId;
            next();
        },
        fetchDeals,
        format
    ];
}

function goLiveDeal() {
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        config,        
        CheckUserAccess,        
        function filterDealById(req, res, next) {            
            var dealId = req.params.dealId;
            if (dealId == undefined || dealId == '') {
                return restHelper.badRequest(res, 'dealId is missing');
            }
            req.yoz.query._id = dealId;
            next();
        },
        fetchDeals,
        dealUpdate,
        updateMerchant,
        format
    ];
}

function CheckUserAccess(req, res, next) {
    var user = req.user;
    var Types = req.yoz.db.Schemas[dbModels.roleModel].Types;

    if (user.roleId.equals(Types.SuperAdminRole) || user.roleId.equals(Types.MerchantAdminRole)) {
        return next();
    } else {
        return restHelper.unAuthorized(res, USER_RESPONSE.UPDATE_CLINIC_UNAUTHORIZED);
    }
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

    if(req.query.golive != undefined){
        req.yoz.query.golive = req.query.golive;
        req.yoz.query.status = false;
    }

    if(req.query.status != undefined){       
        req.yoz.query.status = req.query.status;
    }

    next();
};



function fetchDeals(req, res, next) {   
    var DealModel = req.yoz.db.model(dbModels.dealModel);
    var query = req.yoz.query;
    DealModel.find(query, {}, req.yoz.condition)    
    .populate('merchantId')    
    .exec(function(err, deals) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (deals == undefined || deals.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.dealsObj = deals;
        next();
    });
}

function format(req, res) {
    var dealInfo = req.yoz.dealsObj;
    for (var index = 0; index < dealInfo.length; index++) {
        var element = dealInfo[index];
        element.__v = undefined;
        element.updated_by = undefined;
        element.created_By = undefined;
    }

    if (dealInfo.length == 1) {
        dealInfo[0].__v = undefined;
        dealInfo[0].updated_by = undefined;
        dealInfo[0].created_By = undefined;
        dealInfo = dealInfo[0];
    }
    restHelper.OK(res, dealInfo);
};

function dealUpdate(req, res, next){  
    var modifiedData =  req.body;  
    var dealinfo = req.yoz.dealsObj[0];        
    var AccountModel = req.yoz.db.model(dbModels.accountModel);
    var amountBody = {};
        amountBody.amount = parseFloat(dealinfo.fundAllocation);            
        amountBody.status = ACCOUNT_TRANSACTION_STATUS_SUCCESS;
        amountBody.merchantId = dealinfo.merchantId._id;
        amountBody.userId = dealinfo.merchantId.userId;
        amountBody.dealId = dealinfo._id;  
        if(modifiedData.status != dealinfo.status ){
            if(modifiedData.status && !dealinfo.status){
                var balanceamount = parseFloat(dealinfo.merchantId.amount) - parseFloat(amountBody.amount);
                req.yoz.balanceamount = balanceamount;       
                dealinfo.merchantId.amount = req.yoz.balanceamount;
                amountBody.type = ACCOUNT_TRANSACTION_TYPE_REMOVED;
                amountBody.paymentinfo = 'Paid for Deal Live';
                   
            }else if(dealinfo.status && !modifiedData.status){
                var balanceamount = parseFloat(dealinfo.merchantId.amount) + parseFloat(amountBody.amount);
                req.yoz.balanceamount = balanceamount;       
                dealinfo.merchantId.amount = req.yoz.balanceamount;
                amountBody.type = ACCOUNT_TRANSACTION_TYPE_ADD;
                amountBody.paymentinfo = 'refund for Deal Live';
            }
            dealinfo.status = modifiedData.status;    
            dealinfo.updated_by = req.user._id;
            dealinfo._editor = req.user;
            dealinfo.save(function(err, dealData) {
            if (err) {
                return restHelper.unexpectedError(res, err);
            }
            req.yoz.dealsObj = dealData;            
            var accountObj = new AccountModel(amountBody);
                accountObj.updated_by = req.user._id;
                accountObj._editor = req.user._id;
                accountObj.save(function(err, newAccount) {
                    if (err) {
                        return restHelper.unexpectedError(res, err);
                    }else{
                        next();
                    }                
                });            
            });
        }else{
            req.yoz.dealsObj = req.yoz.dealsObj[0];
            req.yoz.balanceamount = dealinfo.merchantId.amount;
            next();
        }
    
};

function updateMerchant(req, res, next){
    var dealinfo = req.yoz.dealsObj;
    var modifiedData =  req.body;
   
        var MerchantModel = req.yoz.db.model(dbModels.merchantModel);
        var query = {
            _id: dealinfo.merchantId._id
        };   
        MerchantModel.findOne(query, function(err, user) {
            if (err) {
                return restHelper.unexpectedError(res, err);
            }        
            user.amount = req.yoz.balanceamount;
            user.updated_by = req.user._id;
            user._editor = req.user._id; 
            user.save(function(err, newMerchant) {
                    if (err) {
                        return restHelper.unexpectedError(res, err);
                    }
                   
                });
            next();
        });
   
}