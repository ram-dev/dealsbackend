var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var contactSubModel = require('./contactSubModel');

var Schema = mongoose.Schema;

var OutletModel = module.exports = new Schema({
	merchantId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.merchantModel },
	name:{type: String, required: true},
	latitude:{type: String, required: false},
	longitude:{type: String, required: false},
    contacts: contactSubModel, 
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
});

var name = dbModels.outletModel;
module.exports.name = name;
