var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var contactSubModel = require('./contactSubModel');
var drupalHash = require('drupal-hash');
var diff = require('deep-diff').diff;
var async = require('async');
var activityLogg = require('../../util/activityLogg');
var Logger = require(__base + '/lib/util/logger');

const GENDER_MALE = "Male";
const GENDER_FEMALE = "Female";
const GENDER_NA = "N/A";
const MESSAGE_EMAIL = "Please fill a valid email address";
const AVATAR_DEFAULT = "Default.jpg";
const ERROR_EDITOR_UNDEFINED = "this._editor needs to be set in the UserModel object to be able to interract with the model.";
const ERROR_OPTION_EDITOR_UNDEFIEND = "options._editor needs to be set in the update method to be able to interract with the model.";
const WARN_LOGGER_REMOVE_LOGIN_TOKEN_MESSAGE = "Fail to remove login token for id: ";
const WARN_LOGGER_REMOVE_CLINICIAN_RELATION_MESSAGE = "Fail to remove clinician relation for id: ";
const WARN_LOGGER_REMOVE_CLIENT_CLINICIS_RELATION_MESSAGE = "Fail to remove client-clinics relation for user id: ";
const DB_ACTIONS = {
    UPDATE : 'update',
    FINDONEANDUPDATE:'findOneAndUpdate',
    REMOVE:'remove',
    SAVE :"save",
    INIT :"init",
    CREATE:"create"
};
const FIELD_PASSWORD = "password";
const PATH_ID = "functionsId";

var Token = mongoose.model(dbModels.tokenModel);

var Schema = mongoose.Schema;


var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var UserModel = module.exports = new Schema({   
    username: {
        type: String,
        unique: true,
        required: true,
        validate: [validateEmail, MESSAGE_EMAIL],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, MESSAGE_EMAIL]
    },
    password: { type: String, unique: false, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: Schema.Types.String, required: false, enum: [GENDER_MALE, GENDER_FEMALE, GENDER_NA] },
    birthDate: { type: Schema.Types.Date, required: false },
    contacts: contactSubModel,
    version: { type: Number, unique: false, required: true, default: 2 },   
    roleId: { type: Schema.Types.ObjectId, required: true, ref: dbModels.roleModel },
    avatar: { type: String, required: true, default: AVATAR_DEFAULT },
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
    oneTimeToken: { type: String, required: false },
    oneTimeExpires: { type: Date, required: false },    
    deleted: { type: Schema.Types.Boolean, required: true, default: false },
    updated_by: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
    created_By: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },    
    // Number of login atempts. should be resetted on a successfull login
    loginAtempts: { type: Schema.Types.Number, required: true, default: 0 },
    locked: { type: Schema.Types.Boolean, required: true, default: false }, // locks the account
    // the DateTime the lock occured. should be removed when locked property is false.
    lockDate: { type: Schema.Types.Date, required: false }
});

UserModel.post(DB_ACTIONS.INIT, function () {
    this._original = this.toObject();
});

// Execute before each user.save() call
UserModel.pre(DB_ACTIONS.SAVE, function (callback) {
    var user = this;
    user.updated = Date.now();

    // Break out if the password hasn't changed
    if (!user.isModified(FIELD_PASSWORD)) return callback();

    // Password changed so we need to hash it
    async.waterfall([
        function(cb) {           
            cb(null, drupalHash.hashPassword(user.password));
        }
    ], function (err, hash) {
        if (err){
            return callback(err);
        }else{ 
        	user.password = hash;
        	callback();
		}
    });
    
});

UserModel.pre(DB_ACTIONS.SAVE, function (callback) {
    if (this._omitLog === true) {
        return callback();
    }

    if (this._editor == undefined) {
        return callback(new Error(ERROR_EDITOR_UNDEFINED));
    }
    else {
        callback();
    }
});

UserModel.post(DB_ACTIONS.SAVE, function (err, callback) {
    var eventEmitter = activityLogg.getEmitter();
    
    if (err) {
        return callback();
    }

    if (this._omitLog === true) {
        return callback();
    }

    var original = this._original || { contacts: {} };
    var newObj = this.toObject();
    newObj.contacts = newObj.contacts || {};
    var delta = diff(original, newObj);
    if (!this.isNew) {
        eventEmitter.emit(DB_ACTIONS.UPDATE, dbModels.userModel, this._id, this._editor, delta);
    }
    else {
        eventEmitter.emit(DB_ACTIONS.CREATE, dbModels.userModel, this._id, this._editor, delta);
    }

    callback();
});



UserModel.post(DB_ACTIONS.REMOVE, function (user) {
    Token.remove({ userId: user._id }, function (err) {
        if (err) {
            Logger.warn(WARN_LOGGER_REMOVE_LOGIN_TOKEN_MESSAGE + user._id, err);
        }
    });
   
});


UserModel.pre(DB_ACTIONS.UPDATE, function (callback) {
    var query = this;
    this._update.$set.updated = Date.now();

    if (query._update.$set.password !== undefined) {
        // Password changed so we need to hash it
        async.waterfall([
            function(cb) {           
                cb(null, drupalHash.hashPassword(query._update.$set.password));
            }
        ], function (err, hash) {
            if (err){
                return callback(err);
            }else{
            	query._update.$set.password = hash;
            	callback();
			}
        });
        
    }
    else {
        callback();
    }
});

UserModel.pre(DB_ACTIONS.UPDATE, function (callback) {
    var self = this;
    var id = self._conditions._id;
    self.findOne({ _id: id }, function (err, doc) {
        self._original = doc;
        callback();
    });
});

UserModel.pre(DB_ACTIONS.UPDATE, checkEditor);
UserModel.pre(DB_ACTIONS.FINDONEANDUPDATE, checkEditor);

UserModel.post(DB_ACTIONS.UPDATE, saveLog);
UserModel.post(DB_ACTIONS.FINDONEANDUPDATE, saveLog);

UserModel.pre(DB_ACTIONS.FINDONEANDUPDATE, function (callback) {
    var query = this;
    this._update.$set.updated = Date.now();

    if (query._update.$set === undefined) {
        return callback();
    }

    if (query._update.$set.password !== undefined) {
        // Password changed so we need to hash it
        async.waterfall([
            function(cb) {           
                cb(null, drupalHash.hashPassword(query._update.$set.password));
            }
        ], function (err, hash) {
            if (err){
                return callback(err);
            }else{
            	query._update.$set.password = hash;
            	callback();
			}
        });
       
    }
    else {
        callback();
    }
});

UserModel.methods.verifyPassword = function (password, cb) {
    cb(null, drupalHash.checkPassword(password, this.password));
    
};

UserModel.methods.hashPassword = function (password, callback) {
    // Password changed so we need to hash it
    async.waterfall([
        function(cb) {           
            cb(null, drupalHash.hashPassword(password));
        }
    ], function (err, hash) {
        if (err){
            return callback(err);
        }else{
        	return callback(null, hash);
		}
    });
   
};

UserModel.methods.hasAccess = function (funcName, done) {
    var roleModel = mongoose.model(dbModels.roleModel);

    roleModel.findOne({ _id: this.roleId }).
        populate({
            path: PATH_ID,
            match: {
                name: funcName
            }
        }).
        exec(function (err, role) {
            var result = false;
            if (role != undefined) {
                result = role.functionsId.length > 0;
            }
            done(err, result);
        });
};

function checkEditor(callback) {
    if (this.options._omitLog === true) {
        return callback();
    }

    if (this.options._editor == undefined) {
        return callback(new Error(ERROR_OPTION_EDITOR_UNDEFIEND));
    }
    else {
        callback();
    }
};

function saveLog(err, callback) {
    var eventEmitter = activityLogg.getEmitter();

    if (err) {
        return callback();
    }

    if (this.options._omitLog === true) {
        return callback();
    }

    try {
        var self = this;
        var id = self._conditions._id;
        self.findOne({ _id: id }, function (err, doc) {
            if (err){
                Logger.warn(err);
            }              
            else {
                var original = self._original || { contacts: {} };
                var newObj = doc;
                newObj.contacts = newObj.contacts || {};
                var t = original.toObject();
                var y = newObj.toObject();
                var delta = diff(original.toObject(), newObj.toObject());

                eventEmitter.emit(DB_ACTIONS.UPDATE, dbModels.userModel, original._id, this.options._editor, delta);
            }
        });
    } catch (err) {       
        Logger.warn(err.message);
    } finally {
        callback();
    }
}

var name = dbModels.userModel;
module.exports.name = name;
