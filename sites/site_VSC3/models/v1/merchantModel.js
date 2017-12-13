var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var Schema = mongoose.Schema;

var MerchantModel = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true, unique: true},   
    categories: [{ type: Schema.Types.ObjectId, required: true, ref: dbModels.categoryType }], 
    amenities: [{ type: Schema.Types.ObjectId, required: false, ref: dbModels.amenityType }], 
    url: { type: Schema.Types.String, required: false },
    funds : {type: Schema.Types.String, required: false},
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
    updated_by: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
    created_By: { type: Schema.Types.ObjectId, required: false, ref: dbModels.userModel },
});

var name = dbModels.merchantModel;
module.exports.name = name;
