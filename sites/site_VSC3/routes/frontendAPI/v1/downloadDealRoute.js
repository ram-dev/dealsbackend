'use strict'
var passport = require('../../../controllers/passport');
var restHelper = require('../../../util/restHelper');
var dbModels = require('../../../util/dbModels');
var async = require("async");
var Config = require('../../../config');
var mongoose = require('mongoose');
var activityLogg = require('../../../util/activityLogg');

const STRINGS = {
    
}

const USER_RESPONSE = {
     
};

module.exports.use = function (Router) {
    Router.get('/v1/downloaddeal/:merchantId', getAllDownloadDeal());   
    Router.post('/v1/downloaddeal/:merchantid/create', createDownloadDeal());    
};

function getAllDownloadDeal(){
    return [
    ];
}

function createDownloadDeal() {
    return [
    ];
}