var mongoose = require('mongoose');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

var SubAmenityTypeSchema = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true},    
    aminityId:{ type: Schema.Types.ObjectId, ref : dbModels.amenityType}   
});

var name = dbModels.subAmenityType;
module.exports.name = name;
