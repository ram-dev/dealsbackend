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

    Router.get('/v1/merchant/:merchantid', getMerchant());
    Router.post('/v1/merchant/:merchantid', merchantSave());
    Router.post('/v1/merchant/:merchantid/images', merchantSaveImg());
    Router.get('/v1/merchant/:merchantid/outlet', getMerchantOutlet());
    Router.get('/v1/merchant/:merchantid/outlet/:outletid', getMerchantOutlet());
    Router.post('/v1/merchant/:merchantid/outlet', merchantOutlet());
    Router.put('/v1/merchant/:merchantid/outlet/:outletid', merchantOutlet());
    Router.delete('/v1/merchant/:merchantid/outlet/:outletid', deleteMerchantOutlet());

};

function getMerchant(){
    return [
    ];
}

function getMerchantOutlet() {
    return [
    ];
}

function merchantSave(){
    return [
    ];
}

function merchantSaveImg(){
    return [
    ];
}

function merchantOutlet(){
    return [
    ];
}

function deleteMerchantOutlet(){
    return [
    ];
}