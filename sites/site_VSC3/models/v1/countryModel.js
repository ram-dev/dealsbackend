var mongoose = require('mongoose');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

var CountrySchema = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true},    
  	created_at: Date
});

var name = dbModels.countryModel;
module.exports.name = name;