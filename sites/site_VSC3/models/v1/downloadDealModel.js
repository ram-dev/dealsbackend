var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var Schema = mongoose.Schema;

var DownloadDealModel = module.exports = new Schema({
	dealId: {type: Schema.Types.ObjectId, required: true, ref: dbModels.dealModel },
	dealName: {type: Schema.Types.String, required: true },
	couponCode: {type: Schema.Types.String, required: true, unique: true},
    contactNumber: {type: Schema.Types.String, required: true},
    contactName: {type: Schema.Types.String, required: false},
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
});

var name = dbModels.downloadDealModel;
module.exports.name = name;
