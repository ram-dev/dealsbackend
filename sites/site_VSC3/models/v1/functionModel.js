var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var async = require('async');
var Logger = require(__base + '/lib/util/logger');
var Schema = mongoose.Schema;
const STRINGS = {
    WARN_LOGGER_MESSAGE : "Creating Function collection.",
}
const COLLECTION_NAME = "functions";
const CLINIC_READ = "clinic_read";
const CLINIC_UPDATE = "clinic_update";
const CLINIC_DELETE = "clinic_delete";
const CLINIC_CREATE = "clinic_create";
const CLIENT_READ = "client_read";
const CLIENT_UPDATE = "client_update";
const CLIENT_DELETE = "client_delete";
const CLIENT_CREATE = "client_create";
const CLINICIAN_READ = "clinician_read";
const CLINICIAN_UPDATE = "clinician_update";
const CLINICIAN_DELETE = "clinician_delete";
const CLINICIAN_CREATE = "clinician_create";
const CLINICADMIN_READ = "clinicAdmin_read";
const CLINICADMIN_UPDATE = "clinicAdmin_update";
const CLINICADMIN_DELETE = "clinicAdmin_delete";
const CLINICADMIN_CREATE = "clinicAdmin_create";
const SUPERADMIN_READ = "superAdmin_read";
const SUPERADMIN_UPDATE = "superAdmin_update";
const SUPERADMIN_DELETE = "superAdmin_delete";
const SUPERADMIN_CREATE = "superAdmin_create";

var FunctionSchema = module.exports = new Schema({
    name: { type: Schema.Types.String, required: true, unique: true },
    _read: { type: Schema.Types.Boolean, required: true, default: false },
    _update: { type: Schema.Types.Boolean, required: true, default: false },
    _delete: { type: Schema.Types.Boolean, required: true, default: false },
    _create: { type: Schema.Types.Boolean, required: true, default: false },
});

FunctionSchema.CreateData = function (connection, done) {

    connection.db.listCollections({ name: COLLECTION_NAME })
        .next(function (err, collinfo) {
            if (err) {
                Logger.warn(err);               
                return done(err);
            }

            if (!collinfo) {
                Logger.warn(STRINGS.WARN_LOGGER_MESSAGE);               
                var Functions = connection.model(FunctionSchema.name);

                var objectArray = [{
                    name: CLINIC_READ,
                    _read: true,
                    _update: false,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLINIC_UPDATE,
                    _read: false,
                    _update: true,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLINIC_DELETE,
                    _read: false,
                    _update: false,
                    _delete: true,
                    _create: false
                },
                {
                    name: CLINIC_CREATE,
                    _read: false,
                    _update: false,
                    _delete: false,
                    _create: true
                },
                {
                    name: CLIENT_READ,
                    _read: true,
                    _update: false,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLIENT_UPDATE,
                    _read: false,
                    _update: true,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLIENT_DELETE,
                    _read: false,
                    _update: false,
                    _delete: true,
                    _create: false
                },
                {
                    name: CLIENT_CREATE,
                    _read: false,
                    _update: false,
                    _delete: false,
                    _create: true
                },
                {
                    name: CLINICIAN_READ,
                    _read: true,
                    _update: false,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLINICIAN_UPDATE,
                    _read: false,
                    _update: true,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLINICIAN_DELETE,
                    _read: false,
                    _update: false,
                    _delete: true,
                    _create: false
                },
                {
                    name: CLINICIAN_CREATE,
                    _read: false,
                    _update: false,
                    _delete: false,
                    _create: true
                },
                {
                    name: CLINICADMIN_READ,
                    _read: true,
                    _update: false,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLINICADMIN_UPDATE,
                    _read: false,
                    _update: true,
                    _delete: false,
                    _create: false
                },
                {
                    name: CLINICADMIN_DELETE,
                    _read: false,
                    _update: false,
                    _delete: true,
                    _create: false
                },
                {
                    name: CLINICADMIN_CREATE,
                    _read: false,
                    _update: false,
                    _delete: false,
                    _create: true
                },
                {
                    name: SUPERADMIN_READ,
                    _read: true,
                    _update: false,
                    _delete: false,
                    _create: false
                },
                {
                    name: SUPERADMIN_UPDATE,
                    _read: false,
                    _update: true,
                    _delete: false,
                    _create: false
                },
                {
                    name: SUPERADMIN_DELETE,
                    _read: false,
                    _update: false,
                    _delete: true,
                    _create: false
                },
                {
                    name: SUPERADMIN_CREATE,
                    _read: false,
                    _update: false,
                    _delete: false,
                    _create: true
                },
                ];

                async.each(objectArray, function (element, cb) {
                    var func = new Functions(element);
                    func.save(function (err) {
                        if (err) {
                            Logger.warn(err);                            
                        }

                        cb(err);
                    });
                }, function (err) {
                    done(err);
                });
            } else {
                return done();
            }
        });
};

var name = dbModels.functionModel;
module.exports.name = name;