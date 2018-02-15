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
    Router.get('/v1/deal', getAllDeal());
    Router.get('/v1/deal/:dealId', getDealBydealID());   
};

function getAllDeal() {
    return [
        config,
        queryPageing,        
        fetchDealsByCity,
        filterCity,
        formatAll
    ];
}

function getDealBydealID() {
    return [       
        config,       
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

function config(req, res, next) {
    req.yoz.query = {};
    req.yoz.query.status = true;
    req.yoz.condition = {};
    next();
};

function queryPageing(req, res, next) {
    console.log(req.query);
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

function fetchDealsByCity(req, res, next) {
   
    var DealModel = req.yoz.db.model(dbModels.dealModel);
    var query = req.yoz.query;
    var cityQuery ={};
    if(req.query.city){
        cityQuery = {'contacts.city': req.query.city};
    }
    DealModel.find(query, {}, req.yoz.condition)
    .populate('mainCategoryId')
    .populate('merchantId')
    .populate('outletIds', null, cityQuery,{})
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

function filterCity(req, res, next){
    var deal = req.yoz.dealsObj;
    var result =[];
    for(var i = 0; i < deal.length ; i++){
        if(deal[i].outletIds.length > 0){
            result.push(deal[i]);
        }
    }
    req.yoz.dealsObj = [];
    req.yoz.dealsObj = result;
    next();
}

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

function formatAll(req,res){
    var dealInfo = req.yoz.dealsObj;
    var result = [];
    for (var index = 0; index < dealInfo.length; index++) {
        var element = dealInfo[index];
        var obj = {};
        obj.id = element._id;
        obj.name = element.name;
        obj.mainCategoryId = [];
        obj.mainCategoryId.push(element.mainCategoryId._id);        
        obj.discount = element.discount;
        obj.offer = element.offer;
        obj.images = [];
        obj.outlets = [];
        for(var i = 0 ; i < element.images.length ; i++){
            obj.images.push(element.images[i].path);
        }
        for(var i = 0 ; i < element.outletIds.length ; i++){
            var contact = {};
            contact.city = element.outletIds[i].contacts.city;
            console.log(contact);
            obj.outlets.push(contact);
        }
        result.push(obj);
    }
    restHelper.OK(res, result);
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

