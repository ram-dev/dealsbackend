var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
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
const ERROR_OPTION_EDITOR_UNDEFIEND = "options._editor needs to be set in the update method to be able to interract with the model.";
const ERROR_EDITOR_UNDEFINED = "this._editor needs to be set in the UserModel object to be able to interract with the model.";

var MerchantModel = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true, unique: true},   
    categories: [{ type: Schema.Types.ObjectId, required: true, ref: dbModels.categoryType }], 
    amenities: [{ type: Schema.Types.ObjectId, required: false, ref: dbModels.amenityType }], 
    url: { type: Schema.Types.String, required: false },
    amount : {type: Schema.Types.String, required: false},
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
    updated_by: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
    created_By: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
});

MerchantModel.post(DB_ACTIONS.INIT, function () {
    this._original = this.toObject();
});

MerchantModel.pre(DB_ACTIONS.SAVE, setUpdateDate);
MerchantModel.pre(DB_ACTIONS.FINDONEANDUPDATE, setUpdateDate);
MerchantModel.pre(DB_ACTIONS.UPDATE, setUpdateDate);

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

    callback();
};

MerchantModel.pre(DB_ACTIONS.SAVE, function (callback) {
    var eventEmitter = activityLogg.getEmitter();
    var original = this._original || {};
    var delta = diff(original, this.toObject());
    if (!this.isNew) {
        eventEmitter.emit(DB_ACTIONS.UPDATE, dbModels.merchantModel, this._id, this._original.created_By, this._editor, delta);
    }
    else {
        eventEmitter.emit(DB_ACTIONS.CREATE, dbModels.merchantModel, this._id, this.created_By, this._editor, delta);
    }

    callback();
});

var name = dbModels.merchantModel;
module.exports.name = name;
