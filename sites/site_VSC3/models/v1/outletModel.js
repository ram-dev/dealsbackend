var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var contactSubModel = require('./contactSubModel');
var Schema = mongoose.Schema;
var diff = require('deep-diff').diff;
var async = require('async');
var activityLogg = require('../../util/activityLogg');
var Logger = require(__base + '/lib/util/logger');
const DB_ACTIONS = {
    UPDATE : 'update',
    FINDONEANDUPDATE:'findOneAndUpdate',
    REMOVE:'remove',
    SAVE :"save",
    INIT :"init",
    CREATE:"create"
};
const ERROR_EDITOR_UNDEFINED = "this._editor needs to be set in the UserModel object to be able to interract with the model.";


var OutletModel = module.exports = new Schema({
	merchantId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.merchantModel },
    userId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.userModel }, 
	name:{type: String, required: true},
	latitude:{type: String, required: false},
	longitude:{type: String, required: false},
    contacts: contactSubModel, 
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
    updated_by: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
    created_by: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
});

OutletModel.post(DB_ACTIONS.INIT, function () {
    this._original = this.toObject();
});

OutletModel.pre(DB_ACTIONS.SAVE, setUpdateDate);
OutletModel.pre(DB_ACTIONS.FINDONEANDUPDATE, setUpdateDate);
OutletModel.pre(DB_ACTIONS.UPDATE, setUpdateDate);

function setUpdateDate (callback) {
    if(typeof this._update !== "undefined") {
        this._update.$set.updated = Date.now();
    }
    else {
        this.updated = Date.now();
    }

    if (this._omitLog === true) {
        return callback();
    }

    if (this._editor == undefined) {
        return callback(new Error(ERROR_EDITOR_UNDEFINED));
    }

    var eventEmitter = activityLogg.getEmitter();
    var original = this._original || { contacts: {} };    
    var newObj = this.toObject();
    newObj.contacts = newObj.contacts || {};
    var delta = diff(original, newObj);
    if (!this.isNew) {
        eventEmitter.emit(DB_ACTIONS.UPDATE, dbModels.outletModel, this._id, this._original.merchantId, this._editor, delta);
    }
    else {
        eventEmitter.emit(DB_ACTIONS.CREATE, dbModels.outletModel, this._id, this.merchantId, this._editor, delta);
    }

    callback();
};

var name = dbModels.outletModel;
module.exports.name = name;
