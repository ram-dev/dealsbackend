var mongoose = require('mongoose');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

var CitySchema = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true},    
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: dbModels.stateModel, required:true },
    created_at: Date 
});

var name = dbModels.cityModel;
module.exports.name = name;
