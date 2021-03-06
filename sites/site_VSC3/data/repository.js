var Mongoose = require('mongoose').Mongoose;
var yozDb = module.exports = new Mongoose();
var Config = require('../config');
var async = require('async');


var Schemas = {};


var initModels = module.exports.initModels = function (mongoose) {

    Model = require('../models/v1/accessLogModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/countryModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/stateModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/cityModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);    

    var Model = require('../models/v1/tokenModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);    

    Model = require('../models/v1/categoryType');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model); 

    Model = require('../models/v1/merchantModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/galleryModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/outletModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/amenityType');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/subAmenityType');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);  

    Model = require('../models/v1/dealModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);  

    Model = require('../models/v1/downloadDealModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);
    
    Model = require('../models/v1/functionModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);

    Model = require('../models/v1/roleModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);    

    Model = require('../models/v1/userModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model); 

    Model = require('../models/v1/accountModel');
    Schemas[Model.name] = Model;
    mongoose.model(Model.name, Model);   


};

initModels(yozDb);

module.exports.createDb = function (done) {

    yozDb.connect(Config.db.connectionString);
    var connection = yozDb.connection;

    connection.on('error', function (err) {
        return done(new Error("Failed to connect to db " + Config.db.connectionString + " due to \r\n " + err.message));
    });

    connection.once('open', function () {
        connection.Schemas = Schemas;
        createDate(connection, function (err) {
            done(err, connection);
        });
    });
};

function createDate(connection, done) {

    async.waterfall([
        function (cb) {
            Model = require('../models/v1/functionModel');
            Model.CreateData(connection, cb);
        },
        function (cb) {
            Model = require('../models/v1/roleModel');
            Model.CreateData(connection, cb);
        }
    ], function (err, result) {
        done(err);
    });
}
