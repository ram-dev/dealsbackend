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

    Router.get('/v1/merchant/', getMerchant());
    Router.get('/v1/merchant/:merchantId', getMerchant());
    Router.post('/v1/merchant/:merchantId', merchantSave());
    Router.post('/v1/merchant/:merchantId/images', merchantSaveImg());
    Router.get('/v1/merchant/:merchantId/images', getMerchantImg());
    Router.get('/v1/merchant/:merchantId/outlet', getMerchantOutlet());
    Router.get('/v1/merchant/:merchantId/outlet/:outletId', getMerchantOutlet());
    Router.post('/v1/merchant/:merchantId/outlet', merchantOutletSave());
    Router.put('/v1/merchant/:merchantId/outlet/:outletId', merchantOutletSave());
    Router.delete('/v1/merchant/:merchantId/outlet/:outletId', deleteMerchantOutlet());

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
        format
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
            var merchantModel = req.yoz.db.model(dbModels.merchantModel);
            var merchantObject = new merchantModel(merchant);

            var err = merchantObject.validateSync();

            if (err) {
                return restHelper.badRequest(res, err);
            } else {
                req.yoz.merchantObj = merchantObject;
                next();
            }
        },
        function saveMarchant(req, res) {
            var user = req.user;
            req.yoz.merchantObj.updated_by = user._id;
            var merchantObj = req.yoz.merchantObj;
            merchantObj.save(function(err, newMerchant) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                return res.status(200).json(newMerchant);
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
            galleryObject.save(function(err, newMerchant) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                return res.status(200).json(newMerchant);
            });
        }
    ];
}

function merchantOutletSave() {
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
                next();
            }
            req.yoz.query._id = outletId;
            next();
        },
        CheckUserAccess,
        function validateMerchantOutlet(req, res, next) {
            var outlet = req.body;
            outlet._id = req.yoz.query._id;
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
        function saveMarchantOutlet(req, res) {
            var user = req.user;
            if(req.yoz.query._id === undefined){
                req.yoz.outletObj.created_by = user._id;
                req.yoz.outletObj.updated_by = user._id;
            }else{
                req.yoz.outletObj._id = req.yoz.query._id;
                req.yoz.outletObj.updated_by = user._id;
            }
            var outletObj = req.yoz.outletObj;
            outletObj.save(function(err, newMerchant) {
                if (err) {
                    return restHelper.unexpectedError(res, err);
                }
                return res.status(200).json(newMerchant);
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
        req.yoz.query.merchant = user.merchant;
    }
    next();
};

function queryRestrictToFetchMerchantOutlet(req, res, next) {
    var merchantId = req.params.merchantId;
    var outletId = req.params.outletId;
    if (userInfoId === undefined) {
        return restHelper.badRequest(res, 'merchantId is missing');
    }

    req.yoz.query.merchantId = userInfoId;

    if (outletId === undefined) {
        next();
    }

    req.yoz.query._id = outletId;
    next();
};

function fetchOutlets(req, res, next) {
    var OutletModel = req.yoz.db.model(dbModels.outletModel);
    var query = req.yoz.query;
    OutletModel.find(query, {}, req.yoz.condition).
    exec(function(err, outlet) {
        if (err) {
            return restHelper.unexpectedError(res, err);
        }
        req.yoz.userInfoObj = outlet;
        next();
    });
};

function CheckUserAccess(req, res, next) {
    var user = req.user;
    var Types = req.vsc.db.Schemas[dbModels.roleModel].Types;

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