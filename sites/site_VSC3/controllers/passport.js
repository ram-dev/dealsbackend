var Passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var async = require('async');
var dbModels = require('../util/dbModels');
var db = require(__base).Repository.get('yoz');
var RoleModel = require('../models/v1/roleModel');
var logger = require(__base + '/lib/util/logger');

var Token = db.model(dbModels.tokenModel);
var UserModel = db.model(dbModels.userModel);
var STRINGS = {};
STRINGS.ERROR_UNAUTH = "Unauthorized";
STRINGS.ERROR_INVALIDTOKEN = "Invalid Token";
STRINGS.ERROR_INVALID_REMOTE_ADDRESS = "Invalid remote address";
STRINGS.ERROR_INVALID_USER = "Invalid User"

var error ={};

Passport.use('yoz.merchantAdmin_merchant_SuperAdminBearer', new BearerStrategy({ "passReqToCallback": true },
    function (req, accessToken, callback) {       
        error.message = '';
        async.waterfall([
            function (cb) {
                cb(null, accessToken, req);
            },
            getToken,
            function getUser(token, cb) {
                if (!cb) {
                    cb = token;
                    return cb();
                }

                UserModel.findOne({ _id: token.userId }).
                    and([
                        {
                            $or: [{ roleId: RoleModel.Types.MerchantRole },
                            { roleId: RoleModel.Types.MerchantAdminRole },
                            { roleId: RoleModel.Types.SuperAdminRole }]
                        }
                    ]).
                    exec(function (err, user) {
                        if (err) {
                            logger.error(err);
                            return cb(err);
                        }

                        if (!user) {
                            error.message = STRINGS.ERROR_INVALID_USER;                            
                            return cb();
                        }

                        cb(null, user);
                    });
            }
        ], function (err, result) {                        
            if (err) {
                logger.error(err);
                return callback(err);
            } else if (!result) {
                logger.error(STRINGS.ERROR_UNAUTH +' : '+ error.message);
                return callback(null, false);
            }

            callback(null, result, { scope: '*' });
        });
    }
));

Passport.use('yoz.merchantAdmin_SuperAdminBearer', new BearerStrategy({ "passReqToCallback": true },
    function (req, accessToken, callback) {
        error.message = '';
        async.waterfall([
            function (cb) {
                cb(null, accessToken, req);
            },
            getToken,
            function getUser(token, cb) {
                if (!cb) {
                    cb = token;
                    return cb();
                }

                UserModel.findOne({ _id: token.userId }).
                    and([
                        {
                            $or: [{ roleId: RoleModel.Types.MerchantAdminRole },
                            { roleId: RoleModel.Types.SuperAdminRole }]
                        }
                    ]).
                    exec(function (err, user) {
                        if (err) {
                            logger.error(err);
                            return cb(err);
                        }

                        if (!user) {
                            error.message = STRINGS.ERROR_INVALID_USER;                            
                            return cb();
                        }

                        cb(null, user);
                    });
            }
        ], function (err, result) {            
            if (err) {
                logger.error(err);
                return callback(err);
            } else if (!result) {
                logger.error(STRINGS.ERROR_UNAUTH +' : '+ error.message);
                return callback(null, false);
            }

            callback(null, result, { scope: '*' });
        });
    }
));

Passport.use('yoz.superAdminBearer', new BearerStrategy({ "passReqToCallback": true },
    function (req, accessToken, callback) {
        error.message = '';
        async.waterfall([
            function (cb) {
                cb(null, accessToken, req);
            },
            getToken,
            function getUser(token, cb) {
                if (!cb) {
                    cb = token;
                    return cb();
                }

                UserModel.findOne({ _id: token.userId, roleId: RoleModel.Types.SuperAdminRole }).
                    exec(function (err, user) {
                        if (err) {
                            logger.error(err);
                            return cb(err);
                        }

                        if (!user) {
                            error.message = STRINGS.ERROR_INVALID_USER;    
                            return cb();
                        }

                        cb(null, user);
                    });
            }
        ], function (err, result) {           
            if (err) {
                logger.error(err);
                return callback(err);
            } else if (!result) {
                logger.error(STRINGS.ERROR_UNAUTH +' : '+error.message);
                return callback(null, false);
            }

            callback(null, result, { scope: '*' });
        });
    }
));

function convertCSRFToBearer(req, res, next) {
    if (req.headers['x-csrf-token']) {
        req.headers.authorization = "Bearer " + req.headers['x-csrf-token'];
        delete req.headers['x-csrf-token'];
    }

    next();
};
/**
 * Fetch Token object from the db based on the tokenId
 * @param  {} accessToken
 * @param  {} req
 * @param  {} cb
 */
function getToken(accessToken, req, cb) {
    Token.findOne({ value: accessToken }, function (err, token) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (!token) {   
            error.message = STRINGS.ERROR_INVALIDTOKEN;  
            return cb();
        }

        if (!token.verifyConnection(req.connection.remoteAddress)) {
            token.remove(function () {
                //Do nothing.
            });
            error.message = STRINGS.ERROR_INVALID_REMOTE_ADDRESS;                  
            return cb();
        }

        cb(null, token);
    });
};

module.exports.convertCSRFToBearer = convertCSRFToBearer;
exports.isBearerAndMerchantOrMerchantAdminOrSuperAdmin = Passport.authenticate('yoz.merchantAdmin_merchant_SuperAdminBearer', { session: false });
module.exports.isBearerAndSuperAdminAuthenticated = Passport.authenticate('yoz.superAdminBearer', { session: false });
exports.isBearerAndClinicAdminOrSuperAdmin = Passport.authenticate('yoz.merchantAdmin_SuperAdminBearer', { session: false });