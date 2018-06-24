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
    Router.get('/v1/deal/:merchantId', getAllDeal());
    Router.post('/v1/deal/:merchantId/create', createDeal());
    Router.put('/v1/deal/:merchantId/edit/:dealId', updateDeal());
    Router.get('/v1/deal/:merchantId/view/:dealId', getDealBydealID());
};

function getAllDeal() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        validateMandatoryParam,
        CheckUserAccess,
        queryPageing,
        queryRestrictionForMerchant,
        fetchDeals,
        format
    ];
}

function getDealBydealID() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        validateMandatoryParam,
        CheckUserAccess,
        queryPageing,
        queryRestrictionForMerchant,
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

function createDeal() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        validateMandatoryParam,
        CheckUserAccess,
        validateDeal,
        saveDeal,
        format
    ];
}

function updateDeal() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        validateMandatoryParam,
        CheckUserAccess,
        validateDeal,
        function filterDealById(req, res, next) {
            console.log('test');
            var dealId = req.params.dealId;
            if (dealId == undefined || dealId == '') {
                return restHelper.badRequest(res, 'dealId is missing');
            }
            req.yoz.query._id = dealId;
            next();
        },
        fetchDeals,
        dealUpdate,
        format
    ];
}

function CheckUserAccess(req, res, next) {
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

function validateMandatoryParam(req, res, next) {
    var merchantId = req.params.merchantId;
    if (merchantId == undefined || merchantId == '') {
        return restHelper.badRequest(res, 'merchantId is missing');
    } else {
        req.yoz.query.merchantId = merchantId;
        next();
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

    next();
};

function queryRestrictionForMerchant(req, res, next) {
    var user = req.user;
    var Types = req.yoz.db.Schemas[dbModels.roleModel].Types;

    if (user.roleId.equals(Types.SuperAdminRole) || user.roleId.equals(Types.MerchantAdminRole)) {
        return next();
    } else {
        req.yoz.query.userId = user._id;
        next();
    }
};

function fetchDeals(req, res, next) {
   
    var DealModel = req.yoz.db.model(dbModels.dealModel);
    var query = req.yoz.query;

    DealModel.find(query, {}, req.yoz.condition)
    .populate('mainCategoryId')
    .populate('merchantId')
    .populate('outletIds')
    .populate('subCategoryIds')
    .populate('images')
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

function validateDeal(req, res, next) {
    var deal = req.body;
    deal.merchantId = req.params.merchantId;
    deal.userId = req.body.userId;
    var outletIds = [];
    for (var i = 0; i < deal.outletIds.length; i++) {        
        outletIds.push(deal.outletIds[i]);
    }
    deal.outletIds = outletIds;
    var imgArray = [];
    for (var i = 0; i < deal.images.length; i++) {        
        imgArray.push(deal.images[i]);
    }
    deal.images = imgArray;
    var subCategoryIds = [];
    for (var i = 0; i < deal.subCategoryIds.length; i++) {        
        subCategoryIds.push(deal.subCategoryIds[i]);
    }
    deal.subCategoryIds = subCategoryIds;
    req.yoz.finalBody = deal;
    var DealModel = req.yoz.db.model(dbModels.dealModel);
    var dealObject = new DealModel(deal);
    var err = dealObject.validateSync();
    if (err) {
        return restHelper.badRequest(res, err);
    } else {
        req.yoz.validDealsObj = dealObject;
        req.yoz.validDealsObj.images = deal.images;
        req.yoz.validDealsObj.subCategoryIds = deal.subCategoryIds;
        req.yoz.validDealsObj.outletIds = deal.outletIds;
        next();
    }
};

function saveDeal(req, res, next) {
    var dealData = req.yoz.validDealsObj;
    dealData.created_by = req.user._id;
    dealData._editor = req.user;
    dealData.save(function(err, nData) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        req.yoz.dealsObj = nData;
        next();
    })
};

function dealUpdate(req, res, next){  
    var modifiedData =  req.yoz.finalBody;  
    var dealinfo = req.yoz.dealsObj[0];
    dealinfo.name = modifiedData.name;
    dealinfo.offer = modifiedData.offer;
    dealinfo.mainCategoryId = modifiedData.mainCategoryId;
    dealinfo.outletIds = modifiedData.outletIds;
    dealinfo.offertype = modifiedData.offertype;
    dealinfo.discount = modifiedData.discount;
    dealinfo.offerValidFrom = modifiedData.offerValidFrom;
    dealinfo.offerValidTo = modifiedData.offerValidTo;
    dealinfo.terms = modifiedData.terms;
    dealinfo.images = modifiedData.images;
    dealinfo.subCategoryIds = modifiedData.subCategoryIds;
    dealinfo.offertype_one = modifiedData.offertype_one;
    dealinfo.offertype_two = modifiedData.offertype_two;
    dealinfo.offerDeatils = modifiedData.offerDeatils;
    dealinfo.fundAllocation = modifiedData.fundAllocation;
    dealinfo.dayAllocationType = modifiedData.dayAllocationType;
    dealinfo._editor = req.user;
    dealinfo.status = modifiedData.status || false;
    dealinfo.golive = modifiedData.golive || false;
    dealinfo.updated_by = req.user._id;
    dealinfo.save(function(err, dealData) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        req.yoz.dealsObj = dealData;
        next();
    });
};