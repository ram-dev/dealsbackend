var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var Schema = mongoose.Schema;
const DB_ACTIONS = {
    UPDATE : 'update',
    FINDONEANDUPDATE:'findOneAndUpdate',
    REMOVE:'remove',
    SAVE :"save",
    INIT :"init",
    CREATE:"create"
};
var GalleryModel = module.exports = new Schema({
	merchantId :{ type: Schema.Types.ObjectId, required: true, ref: dbModels.merchantModel },
    img: { data: Buffer, contentType: String },
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },  
});

GalleryModel.pre(DB_ACTIONS.SAVE, setUpdateDate);
GalleryModel.pre(DB_ACTIONS.FINDONEANDUPDATE, setUpdateDate);
GalleryModel.pre(DB_ACTIONS.UPDATE, setUpdateDate);

function setUpdateDate (callback) {
    if(typeof this._update !== "undefined") {
        this._update.$set.updated = Date.now();
    }
    else {
        this.updated = Date.now();
    }         

    callback();
};

var name = dbModels.galleryModel;
module.exports.name = name;
