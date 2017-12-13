var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var Schema = mongoose.Schema;

var GalleryModel = module.exports = new Schema({
	merchantId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.merchantModel },
    img: { data: Buffer, contentType: String },
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },  
});

var name = dbModels.galleryModel;
module.exports.name = name;
