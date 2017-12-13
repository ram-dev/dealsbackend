var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var contactSubModel = require('./contactSubModel');

var Schema = mongoose.Schema;

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

var name = dbModels.dealModel;
module.exports.name = name;
