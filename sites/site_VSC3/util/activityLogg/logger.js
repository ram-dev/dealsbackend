'use strict'

const mongoose = require('../../data/repository');
const Mongoose = require('mongoose');
const dbModels = require('../dbModels');
const accessLogModel = mongoose.model(dbModels.accessLogModel);
const events = require('events');

/**
 * Create a log save entry 
 * 
 * @param {String} dbModel - name of the model
 * @param {Object} objectId - id of the object that has been manipulated
 * @param {ObjectId} ownerId - id of the user that owns the ObjectId if not used ( undefined ) then
 * it will be the same as ObjectId.
 * @param {ObjectId} userEditorId - id of the user that has manipulated object
 * @param {} properties - properties that has been manipulated
 */
function onCreate(dbModel, objectId, ownerId, userEditorId, properties) {
    if (properties == undefined) {
        properties = userEditorId;
        userEditorId = ownerId;
        ownerId = objectId;
    }

    if (ownerId == undefined) {
        ownerId = objectId;
    }

    if (userEditorId instanceof String) {
        userEditorId = Mongoose.Types.ObjectId(userEditorId);
    }
    save(dbModel, objectId, ownerId, userEditorId, "Created", properties);
};

/**
 * Create a log update entry
 * 
 * @param {String} dbModel - name of the model
 * @param {Object} objectId - id of the object that has been manipulated
 * @param {ObjectId} ownerId - id of the user that owns the ObjectId if not used ( undefined ) then
 * it will be the same as ObjectId
 * @param {} userEditorId - id of the user that has manipulated object
 * @param {} properties - properties that has been manipulated
 */
function onUpdate(dbModel, objectId, ownerId, userEditorId, properties) {
    if (properties == undefined) {
        properties = userEditorId;
        userEditorId = ownerId;
        ownerId = objectId;
    }

    if (ownerId == undefined) {
        ownerId = objectId;
    }
    if (userEditorId instanceof String) {
        userEditorId = Mongoose.Types.ObjectId(userEditorId);
    }
    save(dbModel, objectId, ownerId, userEditorId, "Updated", properties);
};

/**
 * Create a log view entry
 * 
 * @param {String} dbModel - name of the model
 * @param {Object} objectId - id of the object that has been manipulated
 * @param {ObjectId} ownerId - id of the user that owns the ObjectId if not used ( undefined ) then
 * it will be the same as ObjectId
 * @param {} userEditorId - id of the user that has manipulated object
 */
function onView(dbModel, objectId, ownerId, userEditorId) {
    if (userEditorId == undefined) {
        userEditorId = ownerId;
        ownerId = objectId;
    }

    if (ownerId == undefined) {
        ownerId = objectId;
    }

    if (userEditorId instanceof String) {
        userEditorId = Mongoose.Types.ObjectId(userEditorId);
    }
    save(dbModel, objectId, ownerId, userEditorId, "Viewed", null);
}


function save(modelName, targetId, ownerId, userId, action, properties) {
    var data = {
        targetModel: modelName,
        targetId: targetId,
        ownerId: ownerId,
        action: action,
        properties: properties
    };
    if (userId != undefined) {
        data.userId = userId;
    }

    var log = new accessLogModel(data);
    log.save(function (err) {
        if (err) {
            console.warn("Failed to add accesslog data. " + err.message);
        }
    });
};


module.exports = {
    onCreate,
    onUpdate,
    onView
}