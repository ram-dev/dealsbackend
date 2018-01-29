'use strict'
var passport = require('../../../controllers/passport');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var async = require("async");
var Config = require('../../../config');
var mongoose = require('mongoose');
var activityLogg = require('../../../util/activityLogg');
var fs =require('fs')

const STRINGS = {

}

const USER_RESPONSE = {
    UPDATE_CLINIC_UNAUTHORIZED: "Unauthorized",
    STATUS_OK: "OK"
};

module.exports.use = function(Router) {

    Router.get('/v1/merchant', getMerchant());
    Router.get('/v1/merchant/:merchantId', getMerchant());
    Router.post('/v1/merchant/:merchantId', merchantSave());
    Router.post('/v1/merchant/:merchantId/images', merchantSaveImg());
    Router.get('/v1/merchant/:merchantId/images', getMerchantImg());      

};

function getMerchant() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        CheckUserAccess,
        config,
        queryPageing,
        queryRestrictionForMerchant,
        queryRestrictToFetchMerchant,
        FetchMechants,
        format
    ]
}

function getMerchantImg(){
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        function(req, res, next) {
            var merchantId = req.params.merchantId;
            if (merchantId === undefined) {
                return restHelper.badRequest(res, 'merchantId is missing');
            }
            next();
        },
        CheckUserAccess,
        config,
        queryPageing,
        function fetchImg(req, res, next){            
            req.yoz.query.merchantId = req.params.merchantId;            
            var GalleryModel = req.yoz.db.model(dbModels.galleryModel);
            var query = req.yoz.query;
            GalleryModel.find(query, {}, req.yoz.condition).
            exec(function(err, outlet) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                req.yoz.userInfoObj = outlet;               
                
                next();
            });
        },
        formatimg
    ]
}

function merchantSave() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        function(req, res, next) {
            var merchantId = req.params.merchantId;
            if (merchantId === undefined) {
                return restHelper.badRequest(res, 'merchantId is missing');
            }
            next();
        },
        CheckUserAccess,        
        function validateMerchant(req, res, next) {
            var merchant = req.body;
            if(merchant.categoryId.length == 0){
                return restHelper.badRequest(res, 'categories is required');
            }
            var MerchantModel = req.yoz.db.model(dbModels.merchantModel);
            var merchantObject = new MerchantModel(merchant);

            var err = merchantObject.validateSync();

            if (err) {
                return restHelper.badRequest(res, err);
            } else {                   
                next();
            }
        },
        function fetchMechant(req, res, next){
            var MerchantModel = req.yoz.db.model(dbModels.merchantModel);
            MerchantModel.findOne({_id: req.params.merchantId}, function (err, merchantDetails) {
                if(err){
                    return restHelper.unexpectedError(res, err); 
                }
                req.yoz.merchantObj = merchantDetails;
                next();
            })
            
        },
        function saveMarchant(req, res) {
            var user = req.user;    
            addParameters(req.yoz.merchantObj, req.body);
            req.yoz.merchantObj.updated_by = user._id;
            req.yoz.merchantObj._editor = user._id;                     
            req.yoz.merchantObj.categoryId = req.body.categoryId;
            req.yoz.merchantObj.amenityId = req.body.amenityId;
            var merchantObj = req.yoz.merchantObj;           
            merchantObj.save(function(err) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                return res.status(200).json({'status':'OK'});
            });
        }
    ];
}

function merchantSaveImg() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        function(req, res, next) {
            var merchantId = req.params.merchantId;
            if (merchantId === undefined) {
                return restHelper.badRequest(res, 'merchantId is missing');
            }
            next();
        },
        CheckUserAccess,
        function validateGallery(req, res, next) {
            var gallery = req.body;
            var GalleryModel = req.yoz.db.model(dbModels.galleryModel);
            var galleryObject = new GalleryModel(gallery);
            var err = galleryObject.validateSync();
            if (err) {
                return restHelper.badRequest(res, err);
            } else {
                req.yoz.galleryObject = galleryObject;
                next();
            }
        },
        function saveGallery(req, res) {
            var user = req.user;
            var galleryObject = req.yoz.galleryObject;
            const buffer = Buffer.from(req.body.image.data, 'base64');
            galleryObject.image.data = buffer;
            galleryObject.save(function(err, newMerchant) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                return res.status(200).json(newMerchant);
            });
        }
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

function formatimg(req, res) {
    var userInfo = req.yoz.userInfoObj;
    var result = [];
    for(var i = 0; i < userInfo.length; i++){
        var obj ={};
        //obj.image = userInfo[i]._doc.image;
        obj._id = userInfo[i]._doc._id;
        obj.merchantId = userInfo[i]._doc.merchantId;
        var s = new Buffer(userInfo[i]._doc.image.data, 'binary').toString('base64');
        obj.imgdata = 'data:'+userInfo[i]._doc.image.filetype+';base64,'+s;
        result.push(obj);                 
    }
    res.send(result);
    
    //res.end(restHelper.OK(res, result));
};

function format(req, res) {
    var userInfo = req.yoz.userInfoObj;
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


