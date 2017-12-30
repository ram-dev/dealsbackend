var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var Schema = mongoose.Schema;
const DB_ACTIONS = {
    UPDATE : 'update',
    FINDONEANDUPDATE:'findOneAndUpdate',
    REMOVE:'remove',
    SAVE :"save",
    INIT :"init",
    CREATE:"create"
};
var DownloadDealModel = module.exports = new Schema({
	dealId: {type: Schema.Types.ObjectId, required: true, ref: dbModels.dealModel },
	dealName: {type: Schema.Types.String, required: true },
	couponCode: {type: Schema.Types.String, required: true, unique: true},
    contactNumber: {type: Schema.Types.String, required: true},
    merchantId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.merchantModel },
    contactName: {type: Schema.Types.String, required: false},
    oneTimeExpires: { type: Date, required: false },   
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
});


DownloadDealModel.pre(DB_ACTIONS.SAVE, setUpdateDate);
DownloadDealModel.pre(DB_ACTIONS.FINDONEANDUPDATE, setUpdateDate);
DownloadDealModel.pre(DB_ACTIONS.UPDATE, setUpdateDate);

function setUpdateDate (callback) {
    if(typeof this._update !== "undefined") {
        this._update.$set.updated = Date.now();
    }
    else {
        this.updated = Date.now();
    }         

    callback();
};

var name = dbModels.downloadDealModel;
module.exports.name = name;
