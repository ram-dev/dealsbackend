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
    Router.get('/v1/category', getAllCategory());
    Router.get('/v1/amenity', getAllAmenity());
    Router.get('/v1/subamenity', getAllSubAmenity());
};

function getAllCategory() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        queryPageing,        
        fetchCategory,
        format
    ];
}

function getAllAmenity() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        queryPageing,        
        fetchAmenity,
        format
    ];
}

function getAllSubAmenity() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        config,
        queryPageing,        
        fetchSubAmenity,
        format
    ];
}

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

function fetchCategory(req, res, next) {   
    var CategoryType = req.yoz.db.model(dbModels.categoryType);
    var query = req.yoz.query;

    CategoryType.find(query, {}, req.yoz.condition).
    exec(function(err, result) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (result == undefined || result.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.resultObject = result;
        next();
    });
}

function fetchAmenity(req, res, next){
    var AmenityType = req.yoz.db.model(dbModels.amenityType);
    var query = req.yoz.query;

    AmenityType.find(query, {}, req.yoz.condition).
    exec(function(err, result) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (result == undefined || result.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.resultObject = result;
        next();
    }); 
}

function fetchSubAmenity(req, res, next){
    var SubAmenityType = req.yoz.db.model(dbModels.subAmenityType);
    var query = req.yoz.query;

    SubAmenityType.find(query, {}, req.yoz.condition).
    exec(function(err, result) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (result == undefined || result.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.resultObject = result;
        next();
    }); 
}

function format(req, res) {
    var resultInfo = req.yoz.resultObject;
    for (var index = 0; index < resultInfo.length; index++) {
        var element = resultInfo[index];
        element.__v = undefined;       
    }

    if (resultInfo.length == 1) {
        resultInfo[0].__v = undefined;               
    }
    restHelper.OK(res, resultInfo);
};

