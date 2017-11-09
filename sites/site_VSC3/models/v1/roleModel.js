var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var async = require('async');
var Logger = require(__base + '/lib/util/logger');
var Schema = mongoose.Schema;

const WARN_LOGGER_MESSAGE = "Creating Roles collection.";
const ROLE_MERCHANT_NAME = 'Merchant';
const ROLE_MERCHANTADMIN_NAME = 'MerchantAdmin';
const ROLE_SUPERADMIN_NAME = 'SuperAdmin';
const ROLE_CLIENT_NAME = 'Client';
const CLIENT_ROLE_ID ="584e7514df689623c3b0e036";
const MERCHANT_ROLE_ID ="584e7514df689623c3b0e037";
const MERCHANTADMIN_ROLE_ID ="584e7514df689623c3b0e038";
const SUPERADMIN_ROLE_ID ="584e7514df689623c3b0e039";

var RoleSchema = module.exports = new Schema({
    name: { type: Schema.Types.String, required: true, unique: true },
    functionsId: [{ type: Schema.Types.ObjectId, required: false, ref: dbModels.functionModel }]
});


module.exports.Types = {
    ClientRole: CLIENT_ROLE_ID,
    MerchantRole: MERCHANT_ROLE_ID,
    MerchantAdminRole: MERCHANTADMIN_ROLE_ID,
    SuperAdminRole: SUPERADMIN_ROLE_ID
};

var functionsArray = [];
var name = dbModels.roleModel;
module.exports.name = name;



RoleSchema.CreateData = function(connection, done) {

    var rolemodel = connection.model(dbModels.roleModel);
    Logger.warn(WARN_LOGGER_MESSAGE);
    rolemodel.find({}).
        exec(function(err, roles) {
            if (err) {               
                Logger.warn(err);
                return done(err);
            }
            var func = connection.model(dbModels.functionModel);

            func.find({}, function(err, fns) {
                functionsArray = fns;

                var objectArray = [{
                    _id: MERCHANT_ROLE_ID,
                    name: ROLE_MERCHANT_NAME,
                    functionsId: [
                        
                    ]
                },
                {
                    _id: MERCHANTADMIN_ROLE_ID,
                    name: ROLE_MERCHANTADMIN_NAME,
                    functionsId: [
                       
                    ]
                },
                {
                    _id: SUPERADMIN_ROLE_ID,
                    name: ROLE_SUPERADMIN_NAME,
                    functionsId: [
                       
                    ]
                },
                {
                    _id: CLIENT_ROLE_ID,
                    name: ROLE_CLIENT_NAME
                }];

                async.each(objectArray, function(value, cb) {
                    var found = false;
                    for (var index = 0; index < roles.length; index++) {
                        var element = roles[index];
                        if (element._id.equals(value._id)) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        var role = new rolemodel(value);
                        role.save(function(err) {
                            cb(err);
                        });
                    }
                    else {
                        cb()
                    }
                }, function(err) {
                    return done(err);
                });
            });
        });
};

function getFunction(name) {
    for (var index = 0; index < functionsArray.length; index++) {
        var element = functionsArray[index];
        if (element.name === name) {
            return element._id;
        }
    }

    return undefined;
}