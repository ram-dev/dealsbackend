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

const ACCOUNT_TRANSACTION_TYPE_ADD = "Added";
const ACCOUNT_TRANSACTION_TYPE_REMOVED = "Paid";
const ACCOUNT_TRANSACTION_STATUS_SUCCESS = "Sucess";
const ACCOUNT_TRANSACTION_STATUS_FAILED = "Failed";


var AccountModel = module.exports = new Schema({   
    amount:{type: String, required: true},
	type:{type: String, required: true, enum: [ACCOUNT_TRANSACTION_TYPE_ADD, ACCOUNT_TRANSACTION_TYPE_REMOVED]},
    status:{type: String, required: true, enum: [ACCOUNT_TRANSACTION_STATUS_SUCCESS, ACCOUNT_TRANSACTION_STATUS_FAILED]},
	merchantId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.merchantModel },
    userId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.userModel },
    dealId :{ type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },	
    paymentinfo :{ type: String, required: false},	
	created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
    updated_by: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
    created_by: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
});


AccountModel.post(DB_ACTIONS.INIT, function () {
    this._original = this.toObject();
});

AccountModel.pre(DB_ACTIONS.SAVE, setUpdateDate);
AccountModel.pre(DB_ACTIONS.FINDONEANDUPDATE, setUpdateDate);
AccountModel.pre(DB_ACTIONS.UPDATE, setUpdateDate);

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
        eventEmitter.emit(DB_ACTIONS.UPDATE, dbModels.accountModel, this._id, this._original.merchantId, this._editor, delta);
    }
    else {
        eventEmitter.emit(DB_ACTIONS.CREATE, dbModels.accountModel, this._id, this.merchantId, this._editor, delta);
    }

    callback();
};

var name = dbModels.accountModel;
module.exports.name = name;
