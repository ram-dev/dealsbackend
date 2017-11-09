var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

var ContactSubSchema = module.exports = new Schema({
    address1: { type: Schema.Types.String, required: false },
    address2: { type: Schema.Types.String, required: false },
    zip: { type: Schema.Types.String, required: false },
    city: { type: Schema.Types.String, required: false },
    state: { type: Schema.Types.String, required: false },
    country: { type: Schema.Types.String, required: false },    
    phone1: { type: Schema.Types.String, required: false },
    phone2: { type: Schema.Types.String, required: false },
    fax:{ type: Schema.Types.String, required: false }
});


var name = dbModels.contactSubModel