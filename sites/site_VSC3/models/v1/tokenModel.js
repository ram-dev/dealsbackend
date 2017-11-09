var mongoose = require('mongoose');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

var TokenSchema = module.exports = new Schema({
    value: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: dbModels.userModel},
    userIp: { type: String, required: true }
});

TokenSchema.methods.verifyConnection = function(reqIp) {
    if( reqIp === this.userIp ){
        return true;
    }
    else {
        return false;
    }
};

var name = dbModels.tokenModel;
module.exports.name = name;
