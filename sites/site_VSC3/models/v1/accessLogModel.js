var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var Schema = mongoose.Schema;

const ACTION_CREATED = "Created";
const ACTION_UPDATED = "Updated";
const ACTION_REMOVED = "Removed";
const ACTION_VIEWED = "Viewed";
const KIND_A = "A";
const KIND_D = "D";
const KIND_E = "E";
const KIND_N = "N";

/**
 * This model is a replica of the model that I generated from the module deep-diff
 * for more information about how to read values please visit https://github.com/flitbit/diff
 */
var accessLogSchema = module.exports = new Schema({
    targetModel: { type: Schema.Types.String, required: true }, // the db model name
    targetId: { type: Schema.Types.ObjectId, required: true },  // id of the object that has been manipulated
    ownerId: { type: Schema.Types.ObjectId, ref: dbModels.userModel, required: false },  // Owner of the targetId object. if owner and taget are the same object then set both to the same. 
    userId: { type: Schema.Types.ObjectId, ref: dbModels.userModel, required: false },  // id of the user that has manipulated the target object
    action: { type: Schema.Types.String, required: true, enum: Types }, // what action has been applied to the target object
    properties: [{  // properties that has been changed for more information about deep-diff look at the link above.
        kind: { type: Schema.Types.String, required: true, enum: [KIND_E, KIND_A, KIND_D, KIND_N] },
        path: [
            { type: Schema.Types.String, required: true }
        ],
        lhs: {},
        rhs: {},
        index: { type: Schema.Types.Number, required: false },
        item: {
            kind: { type: Schema.Types.String, required: false, enum: [KIND_E, KIND_A, KIND_D, KIND_N] },
            path: [
                { type: Schema.Types.String, required: false },
            ],
            lhs: {},
            rhs: {}
        }
    }],
    created: { type: Schema.Types.Date, required: true, default: Date.now }
});

var Types = module.exports.Types = {
    ACTION_CREATED,
    ACTION_UPDATED,
    ACTION_REMOVED,
    ACTION_VIEWED
};

var name = dbModels.accessLogModel;
module.exports.name = name;
