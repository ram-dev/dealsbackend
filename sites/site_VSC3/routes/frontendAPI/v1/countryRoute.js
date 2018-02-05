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

module.exports.use = function (Router) {
    Router.get('/v1/country', getCountry());
    Router.post('/v1/country', createCountry());
    Router.put('/v1/country/:Id', updateCountry());
    Router.get('/v1/state/:countryId', getStates());
    Router.post('/v1/state', createStates());
    Router.put('/v1/state/:Id', updateStates());
    Router.get('/v1/city/:stateId', getCity());
    Router.post('/v1/city', createCity());
    Router.put('/v1/city/:Id', updateCity());
};

function getCountry(){
    return [
        config,
        queryPageing,
        fetchCountry,
        format
    ];
}

function createCountry(){
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        validationCountry,        
        saveCountry
    ];
}

function updateCountry(){
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        function mandatoryParam(req, res, next){
            var countryId = req.params.Id;            
            if (countryId == undefined || countryId == '') {
                return restHelper.badRequest(res, 'countryId is missing');
            } else {               
                next();
            }
        },
        validationCountry,
        findcoutry,       
        saveCountry
    ];
}

function getStates() {
    return [
        config,
        queryPageing,
        function mandatoryParamState(req, res, next){
            var countryId = req.params.countryId;            
            if (countryId == undefined || countryId == '') {
                return restHelper.badRequest(res, 'countryId is missing');
            } else {
                req.yoz.query.countryId = countryId;
                next();
            }
        },
        fetchState,
        format
    ];
}

function createStates() {
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        validationState,        
        saveState
    ];
}

function updateStates() {
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        function mandatoryParam(req, res, next){
            var stateId = req.params.Id;            
            if (stateId == undefined || stateId == '') {
                return restHelper.badRequest(res, 'stateId is missing');
            } else {               
                next();
            }
        },
        validationState,
        findState,
        saveState
    ];
}

function getCity(){
    return [
        config,
        queryPageing,
        function mandatoryParam(req, res, next){
            var stateId = req.params.stateId;            
            if (stateId == undefined || stateId == '') {
                return restHelper.badRequest(res, 'stateId is missing');
            } else {
                req.yoz.query.stateId = stateId;
                next();
            }
        },
        fetchCity,
        format
    ];
}

function createCity(){
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        validationCity,        
        saveCity
    ];
}

function updateCity(){
    return [
        passport.isBearerAndMerchantAdminOrSuperAdmin,
        function mandatoryParam(req, res, next){
            var stateId = req.params.Id;            
            if (stateId == undefined || stateId == '') {
                return restHelper.badRequest(res, 'cityId is missing');
            } else {               
                next();
            }
        },
        validationCity,
        findCity,
        saveCity
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

    next();
};

function fetchCountry(req, res, next){
    var countryModel = req.yoz.db.model(dbModels.countryModel);
    var query = req.yoz.query;

    countryModel.find(query, {}, req.yoz.condition).
    exec(function(err, country) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (country == undefined || country.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.finalObj = country;
        next();
    });
};

function fetchState(req, res, next){
    var stateModel = req.yoz.db.model(dbModels.stateModel);
    var query = req.yoz.query;

    stateModel.find(query, {}, req.yoz.condition).
    exec(function(err, state) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (state == undefined || state.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.finalObj = state;
        next();
    });
};

function fetchCity(req, res, next){
    var cityModel = req.yoz.db.model(dbModels.cityModel);
    var query = req.yoz.query;

    cityModel.find(query, {}, req.yoz.condition).
    exec(function(err, city) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if (city == undefined || city.length == 0) {
            return res.status(200).json([]);
        }
        req.yoz.finalObj = city;
        next();
    });
};

function saveCountry(req, res) {    
    addParameters(req.yoz.countryObj, req.body);
    var countryObj = req.yoz.countryObj;           
    countryObj.save(function(err, result) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        return res.status(200).json(result);
    });
};

function findcoutry(req, res, next){
    req.yoz.countryObj = {};
    var CountryModel = req.yoz.db.model(dbModels.countryModel);
    CountryModel.findOne({_id:req.params.Id}).
    exec(function(err, result){
        if (err) {
            return restHelper.badRequest(res, err);
        } else {                 
            if(result == undefined || result == null){                       
                return restHelper.badRequest(res, 'not found');
            }else{
                req.yoz.countryObj = result;          
                next();
            }
        }
    })
};

function findState(req, res, next){
    req.yoz.stateObj = {};
    var StateModel = req.yoz.db.model(dbModels.stateModel);
    StateModel.findOne({_id:req.params.Id}).
    exec(function(err, result){
        if (err) {
            return restHelper.badRequest(res, err);
        } else { 
            if(result == undefined || result == null){                       
                return restHelper.badRequest(res, 'not found');
            }else{
                req.yoz.stateObj = result;          
                next();
            }
        }
    })
};

function saveState(req, res) {    
    addParameters(req.yoz.stateObj, req.body);
    var stateObj = req.yoz.stateObj;           
    stateObj.save(function(err, result) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        return res.status(200).json(result);
    });
};

function format(req, res){
    var finalInfo = req.yoz.finalObj;
    for (var index = 0; index < finalInfo.length; index++) {
        var element = finalInfo[index];
        element.__v = undefined;
    }   
    restHelper.OK(res, finalInfo);
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

function validationCountry(req, res, next){
    var body = req.body;
    var CountryModel = req.yoz.db.model(dbModels.countryModel);
    var countryObj = new CountryModel(body);
    var err = countryObj.validateSync();
    if (err) {
        return restHelper.badRequest(res, err);
    } else {         
        req.yoz.countryObj = countryObj;          
        next();
    }
};

function validationState(req, res, next){
    var body = req.body;
    var StateModel = req.yoz.db.model(dbModels.stateModel);
    var stateObj = new StateModel(body);
    var err = stateObj.validateSync();
    if (err) {
        return restHelper.badRequest(res, err);
    } else {         
        req.yoz.stateObj = stateObj;          
        next();
    }
};

function validationCity(req, res, next){
    var body = req.body;
    var CityModel = req.yoz.db.model(dbModels.cityModel);
    var cityObj = new CityModel(body);
    var err = cityObj.validateSync();
    if (err) {
        return restHelper.badRequest(res, err);
    } else {         
        req.yoz.cityObj = cityObj;          
        next();
    }
};      

function saveCity(req, res) {    
    addParameters(req.yoz.cityObj, req.body);
    var cityObj = req.yoz.cityObj;           
    cityObj.save(function(err, result) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        return res.status(200).json(result);
    });
};


function findCity(req, res, next){
    req.yoz.cityObj = {};
    var CityModel = req.yoz.db.model(dbModels.cityModel);
    CityModel.findOne({_id:req.params.Id}).
    exec(function(err, result){
        if (err) {
            return restHelper.badRequest(res, err);
        } else { 
            if(result == undefined || result == null){                       
                return restHelper.badRequest(res, 'not found');
            }else{
                req.yoz.cityObj = result;          
                next();
            }
        }
    })
};