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
const ERROR_EDITOR_UNDEFINED = "this._editor needs to be set in the UserModel object to be able to interract with the model.";


var DealModel = module.exports = new Schema({
	name:{type: String, required: true},
	status :{ type: Boolean, required: true, default: false},
	merchantId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.merchantModel },
	mainCategoryId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.categoryType },
	subCategoryIds :[{ type: Schema.Types.ObjectId, required: false, ref: dbModels.categoryType }],
	outletIds:[{type: Schema.Types.ObjectId, required: true, ref: dbModels.outletModel}],	
	offertype:{type: String, required: true},
	offertype_one:{type: String, required: false},
	offertype_two:{type: String, required: false},
	discount:{type: String, required: true},
	offer:{type: String, required: true},
	offerDeatils:{type: String, required: false},
	offerValidFrom:{type: Date, required: true},
	offerValidTo:{type: Date, required: true},
	fundAllocation :{type: String, required: false},
	dayAllocationType :{type: String, required: false},
	terms: {type: String, required: true},
	images:[{ type: Schema.Types.ObjectId, required: true, ref: dbModels.galleryModel }],
	created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now }
});


DealModel.post(DB_ACTIONS.INIT, function () {
    this._original = this.toObject();
});

DealModel.pre(DB_ACTIONS.SAVE, setUpdateDate);
DealModel.pre(DB_ACTIONS.FINDONEANDUPDATE, setUpdateDate);
DealModel.pre(DB_ACTIONS.UPDATE, setUpdateDate);

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
    var original = this._original || {};
    var delta = diff(original, this.toObject());
    if (!this.isNew) {
        eventEmitter.emit(DB_ACTIONS.UPDATE, dbModels.dealModel, this._id, this._original.merchantId, this._editor, delta);
    }
    else {
        eventEmitter.emit(DB_ACTIONS.CREATE, dbModels.dealModel, this._id, this.merchantId, this._editor, delta);
    }

    callback();
};

var name = dbModels.dealModel;
module.exports.name = name;
