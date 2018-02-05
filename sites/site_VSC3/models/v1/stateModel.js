var mongoose = require('mongoose');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

var StateSchema = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true},    
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: dbModels.countryModel, required:true },
    created_at: Date
});

var name = dbModels.stateModel;
module.exports.name = name;