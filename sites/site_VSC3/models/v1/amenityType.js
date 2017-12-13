var mongoose = require('mongoose');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

var AmenityTypeSchema = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true},    
    categortID:{ type: Schema.Types.ObjectId, ref : dbModels.categoryType}   
});

var name = dbModels.amenityType;
module.exports.name = name;
