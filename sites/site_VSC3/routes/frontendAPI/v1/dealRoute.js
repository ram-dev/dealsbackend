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
    Router.get('/v1/deal/:merchantId', getAllDeal());   
    Router.post('/v1/deal/:merchantid/create', saveDeal());
    Router.put('/v1/deal/:merchantid/edit/:dealId', saveDeal());
    Router.get('/v1/deal/:merchantId/view/:dealId', getDealBydealID());
};

function getAllDeal(){
    return [
    ];
}

function getDealBydealID() {
    return [
    ];
}

function saveDeal(){
    return [
    ];
}