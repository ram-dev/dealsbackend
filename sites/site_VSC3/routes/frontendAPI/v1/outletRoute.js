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

    Router.post('/v1/merchant/:merchantId/outlet', saveOutlets());
    Router.put('/v1/merchant/:merchantId/outlet/:outletId', saveOutlets());
    Router.get('/v1/merchant/:merchantId/outlet', getMerchantOutlet());
    Router.get('/v1/merchant/:merchantId/outlet/:outletId', getMerchantOutlet());   
    Router.delete('/v1/merchant/:merchantId/outlet/:outletId', deleteMerchantOutlet());

};

function getMerchantOutlet() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        CheckUserAccess,
        config,
        queryPageing,
        queryRestrictionForMerchant,
        queryRestrictToFetchMerchantOutlet,
        fetchOutlets,
        format
    ];
}

function saveOutlets() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        function(req, res, next) {
            req.yoz.query = {};
            var merchantId = req.params.merchantId; 
            var outletId = req.params.outletId;          
            if (merchantId === undefined) {
                return restHelper.badRequest(res, 'merchantId is missing');
            }   
            if (outletId === undefined) {
                next();
            }else{
                req.yoz.query._id = outletId;
                next();
            }
        },
        CheckUserAccess,
        function validateMerchantOutlet(req, res, next) {
            var outlet = req.body;           
            var OutletModel = req.yoz.db.model(dbModels.outletModel);
            var outletObject = new OutletModel(outlet);

            var err = outletObject.validateSync();

            if (err) {
                return restHelper.badRequest(res, err);
            } else {
                req.yoz.outletObj = outletObject;
                next();
            }
        },
        function saveORUpdateCheck(req, res, next){
            if(req.yoz.query._id){
                var user = req.user;
                var body = req.body;
                var OutletModel = req.yoz.db.model(dbModels.outletModel);
                var query = req.yoz.query;
                OutletModel.findOne( query , function (err, updateoutlet) {
                    if(err){
                        return restHelper.unexpectedError(res, err); 
                    }
                                       
                    updateoutlet.name = body.name;
                    updateoutlet.latitude = body.latitude;
                    updateoutlet.longitude = body.longitude;
                    addParameters(updateoutlet.contacts, body.contacts);
                    updateoutlet.updated_by = user._id;
                    updateoutlet._editor = user._id; 
                    updateoutlet.save(function(err, outletUpdate) {
                        if (err) {
                            return restHelper.unexpectedError(res, err);
                        }else{
                            return res.status(200).json(outletUpdate);
                        }                
                    });                  
                });
            }else{
                next()
            }
        },
        function saveMarchantOutlet(req, res) {
            var user = req.user;
            var outletObj ={};
            outletObj = req.yoz.outletObj;            
            outletObj.created_by = user._id;
            outletObj.updated_by = user._id;
            outletObj._editor = user._id; 
            outletObj.save(function(err, newMerchant) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }else{
                    return res.status(200).json(newMerchant);
                }                
            });
        }
    ];
}

function deleteMerchantOutlet() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        function(req, res, next) {
            req.yoz.query = {};
            var merchantId = req.params.merchantId;
            var outletId = req.params.outletId;
            if (merchantId === undefined) {
                return restHelper.badRequest(res, 'merchantId is missing');
            }
            if(outletId === undefined){
                return restHelper.badRequest(res, 'outletId is missing');
            }
            req.yoz.query._id = outletId;
            next();
        },
        CheckUserAccess,
        function deleteOutlets(req, res, next){
            var OutletModel = req.yoz.db.model(dbModels.outletModel);
            var query = req.yoz.query;
            OutletModel.remove(query, function(err) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                return res.status(200).json({ "status": "OK" });
            });
        }
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
        }
        return restHelper.accessDenied(res);
    } else {
        return restHelper.unAuthorized(res, USER_RESPONSE.UPDATE_CLINIC_UNAUTHORIZED);
    }
};

function config(req, res, next) {
    req.yoz.query = {};
    req.yoz.condition = {};
    req.yoz.outletObj = [];
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

    if (user.roleId.equals(Types.SuperAdminRole)) {
        return next();
    } else {
        req.yoz.query.userId = user._id;
    }
    next();
};

function queryRestrictToFetchMerchantOutlet(req, res, next) {
    var merchantId = req.params.merchantId;
    var outletId = req.params.outletId;
    if (merchantId === undefined) {
        return restHelper.badRequest(res, 'merchantId is missing');
    }

    req.yoz.query.merchantId = merchantId;

    if (outletId === undefined) {
        next();
    }else{
        req.yoz.query._id = outletId;
        next();
    }    
};

function fetchOutlets(req, res, next) {
    var OutletModel = req.yoz.db.model(dbModels.outletModel);
    var query = req.yoz.query;
   
    OutletModel.find(query, {}, req.yoz.condition).
    exec(function(err, outlet) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        if(outlet){
            req.yoz.outletObj = outlet;
        }else{
            req.yoz.outletObj = [];
        }
              
        next();
    });
};

function format(req, res) {
    var userInfo = req.yoz.outletObj;
    var result = [];
    if(userInfo.length == 0){
        return restHelper.OK(res, userInfo);
    }
    for (var index = 0; index < userInfo.length; index++) {
            var element = userInfo[index];
            element.__v = undefined;
            element.updated_by = undefined;
            element.created_By = undefined;
    }

    if (userInfo.length == 1) {
            userInfo[0].__v = undefined;
            userInfo[0].updated_by = undefined;
            userInfo[0].created_By = undefined;
            userInfo = userInfo[0];
    }
    return restHelper.OK(res, userInfo);   
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
