
var Repository = require('./data/repository');
var router = require('./routes/router.js');
var dbModels = require('./util/dbModels');
var async = require('async');
var logger = require(__base + '/lib/util/logger');

var Storage = require('../../Storage');
var fs = require('fs');
var glob = require('glob');

function vsc(sink) {
    self = this;
    self.sink = sink;


    sink.on('loadRouter', function (express, callback) {
        var routes = router.createRoutes(express);
        callback(null, routes);
    });

    sink.on('loadDb', function (repository, callback) {
        Repository.createDb(function (err, connection) {
            if (err) {
                return callback(err);
            }           

            createMainCategoryIfNeeded(connection); 
            createSuperAdmin(connection)

            repository.add("vsc", connection);

            callback();
        });
    });

    sink.on('addCronJobs', function(cronManager, callback){
        callback();
    });
};


function createMainCategoryIfNeeded(connection) {
    connection.db.listCollections({ name: dbModels.categoryType })
        .next(function (err, collinfo) {
            if (err) {
                return logger.error(err);
            }

            if (!collinfo) {
                logger.info('Creating categories collection.');
                var Model = require('./models/v1/categoryType');
                var CategoryType = connection.model(Model.name);

               
                var objectArray = [
                    {
                        _id: "5a290b2d539eb0b14cd91d0c",
                        name: "Food & Beverages",
                        parent: null,
                        ancestors :["5a2919f13fee7034a0fad59f","5a2919f13fee7034a0fad59e","5a2919f13fee7034a0fad59d","5a2919f13fee7034a0fad59c"]
                    },
                    {
                        name : "Fine Dine",
                        _id : "5a2919f13fee7034a0fad59f",
                        parent: "5a290b2d539eb0b14cd91d0c",
                        ancestors: null
                    },
                    {
                        name : "Bar / Pub / Lounge",
                        _id : "5a2919f13fee7034a0fad59e",
                        parent: "5a290b2d539eb0b14cd91d0c",
                        ancestors: null
                    },
                    {
                        name : "Bakery / Fast Food",
                        _id : "5a2919f13fee7034a0fad59d",
                        parent: "5a290b2d539eb0b14cd91d0c",
                        ancestors: null
                    },
                    {
                        name : "Cafe / Confectionery",
                        _id : "5a2919f13fee7034a0fad59c",
                        parent: "5a290b2d539eb0b14cd91d0c",
                        ancestors: null
                    },
                    {
                        name : "Wellness",
                        _id : "5a290b84539eb0b14cd91d1a",
                        parent: null,
                        ancestors: ["5a2919f13fee7034a0fad5a2","5a2919f13fee7034a0fad5a0"]
                    },
                    {
                        name : "Salon",
                        _id : "5a2919f13fee7034a0fad5a2",
                        parent: "5a290b84539eb0b14cd91d1a",
                        ancestors: null
                    },
                    {
                        name : "Health & Fitness",
                        _id : "5a2919f13fee7034a0fad5a0",
                        parent: "5a290b84539eb0b14cd91d1a",
                        ancestors: ["5a2919f13fee7034a0fad5a1"]
                    },
                    {
                        name : "Zumba / Yoga / Aerobics",
                        _id : "5a2919f13fee7034a0fad5a1",
                        parent: "5a2919f13fee7034a0fad5a0",
                        ancestors: null
                    },
                    {
                        name : "Services",
                        _id : "5a290c8f539eb0b14cd91d3d",
                        parent: null,
                        ancestors: [
                        "5a2919f13fee7034a0fad5b7",
                        "5a2919f13fee7034a0fad5b6",
                        "5a2919f13fee7034a0fad5b5",
                        "5a2919f13fee7034a0fad5b4",
                        "5a2919f13fee7034a0fad5b3",
                        "5a2919f13fee7034a0fad5b2",
                        "5a2919f13fee7034a0fad5b1"
                        ]
                    },
                    {
                        name : "Car Wash",
                        _id : "5a2919f13fee7034a0fad5b7",
                        parent: "5a290c8f539eb0b14cd91d3d",
                        ancestors: null
                    },
                    {
                        name : "Pest Control",
                        _id : "5a2919f13fee7034a0fad5b6",
                        parent: "5a290c8f539eb0b14cd91d3d",
                        ancestors: null
                    },
                    {
                        name : "Astrology",
                        _id : "5a2919f13fee7034a0fad5b5",
                        parent: "5a290c8f539eb0b14cd91d3d",
                        ancestors: null
                    },
                    {
                        name : "Photography / Printing",
                        _id : "5a2919f13fee7034a0fad5b4",
                        parent: "5a290c8f539eb0b14cd91d3d",
                        ancestors: null
                    },
                    {
                        name : "Music / Dance Classes",
                        _id : "5a2919f13fee7034a0fad5b3",
                        parent: "5a290c8f539eb0b14cd91d3d",
                        ancestors: null
                    },
                    {
                        name : "Flower / Cake Delivery",
                        _id : "5a2919f13fee7034a0fad5b2",
                        parent: "5a290c8f539eb0b14cd91d3d",
                        ancestors: null
                    },
                    {
                        name : "Training / Coaching Classes",
                        _id : "5a2919f13fee7034a0fad5b1",
                        parent: "5a290c8f539eb0b14cd91d3d",
                        ancestors: null
                    },
                    {
                        name : "E-Shopping",
                        _id : "5a290c83539eb0b14cd91d39",
                        parent: null,
                        ancestors: ["5a2919f13fee7034a0fad5b0"]
                    },
                    {
                        name : "E-Com /Online Services",
                        _id : "5a2919f13fee7034a0fad5b0",
                        parent: "5a290c83539eb0b14cd91d39",
                        ancestors: null
                    },
                    {
                        name : "Entertainment",
                        _id : "57d900c2df896e82ac1f8548",
                        parent: null,
                        ancestors: [
                        "5a2919f13fee7034a0fad5a7",
                        "5a2919f13fee7034a0fad5a6",
                        "5a2919f13fee7034a0fad5a5"
                        ]
                    },
                    {
                        name : "Theatre / Movies",
                        _id : "5a2919f13fee7034a0fad5a7",
                        parent: "57d900c2df896e82ac1f8548",
                        ancestors: null
                    },
                    {
                        name : "Games / Live Events / Concerts",
                        _id : "5a2919f13fee7034a0fad5a6",
                        parent: "57d900c2df896e82ac1f8548",
                        ancestors: null
                    },
                    {
                        name : "Amusement Park",
                        _id : "5a2919f13fee7034a0fad5a5",
                        parent: "57d900c2df896e82ac1f8548",
                        ancestors: null
                    },
                    {
                        name : "Travel",
                        _id : "5a290c78539eb0b14cd91d37",
                        parent: null,
                        ancestors: [
                        "5a2919f13fee7034a0fad5ac",
                        "5a2919f13fee7034a0fad5a8"]
                    },
                    {
                        name : "Domestic",
                        _id : "5a2919f13fee7034a0fad5ac",
                        parent: "5a290c78539eb0b14cd91d37",
                        ancestors: [
                        "5a2919f13fee7034a0fad5af",
                        "5a2919f13fee7034a0fad5ae",
                        "5a2919f13fee7034a0fad5ad"]
                    },
                    {
                        name : "Hotels",
                        _id : "5a2919f13fee7034a0fad5af",
                        parent: "5a2919f13fee7034a0fad5ac",
                        ancestors: null
                    },
                    {
                        name : "Holiday Packages",
                        _id : "5a2919f13fee7034a0fad5ae",
                        parent: "5a2919f13fee7034a0fad5ac",
                        ancestors: null
                    },
                    {
                        name : "Airfare / Tickets",
                        _id : "5a2919f13fee7034a0fad5ad",
                        parent: "5a2919f13fee7034a0fad5ac",
                        ancestors: null
                    },
                    {
                        name : "International",
                        _id : "5a2919f13fee7034a0fad5a8",
                        parent: "5a290c78539eb0b14cd91d37",
                        ancestors: ["5a2919f13fee7034a0fad5ab",
                        "5a2919f13fee7034a0fad5aa",
                        "5a2919f13fee7034a0fad5a9"]
                    },
                    {
                        name : "Hotels",
                        _id : "5a2919f13fee7034a0fad5ab",
                        parent: "5a2919f13fee7034a0fad5a8",
                        ancestors: null
                    },
                    {
                        name : "Holiday Packages",
                        _id : "5a2919f13fee7034a0fad5aa",
                        parent: "5a2919f13fee7034a0fad5a8",
                        ancestors: null
                    },
                    {
                        name : "Airfare / Tickets",
                        _id : "5a2919f13fee7034a0fad5a9",
                        parent: "5a2919f13fee7034a0fad5a8",
                        ancestors: null
                    },
                    {
                        name : "SPA",
                        _id : "5a290ba6539eb0b14cd91d1f",
                        parent: null,
                        ancestors: ["5a2919f13fee7034a0fad5a3"]
                    },
                    {
                        name : "Spa Services",
                        _id : "5a2919f13fee7034a0fad5a3",
                        parent: "5a290ba6539eb0b14cd91d1f",
                        ancestors: ["5a2919f13fee7034a0fad5a4"]
                    },
                    {
                        name : "eShoping",
                        _id : "5a2919f13fee7034a0fad5a4",
                        parent: "5a2919f13fee7034a0fad5a3",
                        ancestors: null
                    }
                ]
                objectArray.forEach(function (element) {
                    var categoryType = new CategoryType(element);
                    categoryType.save(function (err) {
                        if (err) {
                            logger.error(err);
                        }
                    });
                }, this);
            }
        });
}

function createSuperAdmin(connection){
    connection.db.listCollections({ name: dbModels.userModel })
        .next(function (err, userInfo) {
            if (err) {
                return logger.error(err);
            }
           
            if (!userInfo) {
                logger.info('Creating User collection.');
                var Model = require('./models/v1/userModel');
                var roleModel = require('./models/v1/roleModel');
                var UserSuperAdmin = connection.model(Model.name);
                var objectArray = [
                {                                       
                    username : "ram@superadmin.com",
                    password : "123456789",
                    firstName : "Super",
                    lastName : "Admin",
                    gender : "Male",                                   
                    roleId : "584e7514df689623c3b0e039",
                    avatar : "Default.jpg",
                    isManual: true                  
                },
                {                                       
                    username : "ram@test.com",
                    password : "123456789",
                    firstName : "Ram",
                    lastName : "test",
                    gender : "Male",                                       
                    roleId : "584e7514df689623c3b0e039",
                    avatar : "Default.jpg",
                    isManual: true                    
                },
                {                                  
                    username : "ram@merchant.com",
                    password : "123456789",
                    firstName : "Ram",
                    lastName : "merchant",
                    gender : "Male",
                    roleId : "584e7514df689623c3b0e037",
                    avatar : "Default.jpg",
                    isManual: true                    
                },
                {                                  
                    username : "ram@merchantadmin.com",
                    password : "123456789",
                    firstName : "Ram",
                    lastName : "merchantadmin",
                    gender : "Male",                                     
                    roleId : "584e7514df689623c3b0e038",
                    avatar : "Default.jpg",
                    isManual: true                   
                },
                {                                  
                    username : "ram@client.com",
                    password : "123456789",
                    firstName : "Ram",
                    lastName : "client",
                    gender : "Male",                                    
                    roleId : "584e7514df689623c3b0e036",
                    avatar : "Default.jpg",
                    isManual: true                     
                }
                ]
                objectArray.forEach(function (element) {                    
                    var userSuperAdmin = new UserSuperAdmin(element);
                    userSuperAdmin.save(function (err) {                      
                        if (err) {
                            logger.error(err);
                        }
                    });
                }, this);
            }
        });

}

module.exports = vsc;
