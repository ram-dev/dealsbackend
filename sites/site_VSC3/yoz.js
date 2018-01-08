
var Repository = require('./data/repository');
var router = require('./routes/router.js');
var dbModels = require('./util/dbModels');
var async = require('async');
var logger = require(__base + '/lib/util/logger');

var Storage = require('../../Storage');
var fs = require('fs');
var glob = require('glob');

function yoz(sink) {
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
            createMainAmenityIfNeeded(connection);
            createSubAmenityIfNeeded(connection);
            createSuperAdmin(connection);

            repository.add("yoz", connection);

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

function createMainAmenityIfNeeded(connection) {
    connection.db.listCollections({ name: dbModels.amenityType })
        .next(function (err, collinfo) {
            if (err) {
                return logger.error(err);
            }

            if (!collinfo) {
                logger.info('Creating amenityType collection.');
                var Model = require('./models/v1/amenityType');
                var AmenityType = connection.model(Model.name);

               
                var objectArray = [
                    {               
                        _id: "5a533795d8d2095818be8a24",         
                        name: "Time",                        
                        categortID :["5a290b2d539eb0b14cd91d0c", "5a290b84539eb0b14cd91d1a", "5a290ba6539eb0b14cd91d1f"]
                    },
                    {                        
                        name: "Ambience",                        
                        categortID :["5a290b2d539eb0b14cd91d0c"],
                        _id: "5a533795d8d2095818be8a25",
                    },
                    {                        
                        name: "Crisines",                        
                        categortID :["5a290b2d539eb0b14cd91d0c"],
                        _id: "5a533795d8d2095818be8a26",
                    },
                    {                        
                        name: "Other Facilities",                        
                        categortID :["5a290b2d539eb0b14cd91d0c"],
                        _id: "5a533795d8d2095818be8a27",
                    },
                    {                        
                        name: "Beauty Services",                        
                        categortID :["5a290b84539eb0b14cd91d1a"],
                         _id: "5a533795d8d2095818be8a28",
                    },
                    {                        
                        name: "Hair Services",                        
                        categortID :["5a290b84539eb0b14cd91d1a"],
                         _id: "5a533795d8d2095818be8a29",
                    },
                     {                        
                        name: "Nail Service",                        
                        categortID :["5a290b84539eb0b14cd91d1a"],
                         _id: "5a533795d8d2095818be8a2a",
                    },
                     {                        
                        name: "Tattoo & Piercing",                        
                        categortID :["5a290b84539eb0b14cd91d1a"],
                         _id: "5a290b84539eb0b14cd91d1a",
                    },
                     {                        
                        name: "Doorstep Services",                        
                        categortID :["5a290b84539eb0b14cd91d1a", "5a290ba6539eb0b14cd91d1f"],
                        _id: "5a533795d8d2095818be8a2c",
                    },
                     {                        
                        name: "Makeup",                        
                        categortID :["5a290b84539eb0b14cd91d1a"],
                        _id: "5a533795d8d2095818be8a2d",
                    },
                     {                        
                        name: "Outlet Type",                        
                        categortID :["5a290b84539eb0b14cd91d1a", "5a290ba6539eb0b14cd91d1f"],
                        _id: "5a533795d8d2095818be8a2e",
                    },
                     {                        
                        name: "Home Sevice",                        
                        categortID :["5a290b84539eb0b14cd91d1a", "5a290ba6539eb0b14cd91d1f"],
                        _id: "5a533795d8d2095818be8a2f",
                    },
                    {                        
                        name: "Spa Services",                        
                        categortID :["5a290ba6539eb0b14cd91d1f"],
                        _id: "5a533795d8d2095818be8a30",
                    },
                    {                        
                        name: "Massage Type",                        
                        categortID :["5a290ba6539eb0b14cd91d1f"],
                        _id: "5a533795d8d2095818be8a31",
                    },
                    {                        
                        name: "Masseur",                        
                        categortID :["5a290ba6539eb0b14cd91d1f"],
                        _id: "5a533795d8d2095818be8a32",
                    }              
                ]
                objectArray.forEach(function (element) {
                    var amenityType = new AmenityType(element);
                    amenityType.save(function (err) {
                        if (err) {
                            logger.error(err);
                        }
                    });
                }, this);
            }
        });
}

function createSubAmenityIfNeeded(connection) {
    connection.db.listCollections({ name: dbModels.subAmenityType })
        .next(function (err, collinfo) {
            if (err) {
                return logger.error(err);
            }

            if (!collinfo) {
                logger.info('Creating subAmenityType collection.');
                var Model = require('./models/v1/subAmenityType');
                var SubAmenityType = connection.model(Model.name);

                var objectArray = [

                ]
                var objectArray = [
                    {               
                        _id: "5a5342a9c6363e11949a59e6",    
                        name: "Time of service",                        
                        aminityId :"5a533795d8d2095818be8a24"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59e7", 
                        name: "romantic",                        
                        aminityId :"5a533795d8d2095818be8a25"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59e8",     
                        name: "chic",                        
                        aminityId :"5a533795d8d2095818be8a25"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59e9",       
                        name: "exotic",                        
                        aminityId :"5a533795d8d2095818be8a25"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59ea",       
                        name: "classy",                        
                        aminityId :"5a533795d8d2095818be8a25"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59eb",       
                        name: "luxurious",                        
                        aminityId :"5a533795d8d2095818be8a25"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59ec",        
                        name: "American",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                          _id: "5a5342a9c6363e11949a59ed",      
                        name: "Arabian",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59ee",        
                        name: "Chinese",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59ef",       
                        name: "Thai",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f0",       
                        name: "Continental",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f1",       
                        name: "French",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f2",       
                        name: "Italian",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f3",       
                        name: "Lebanese",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f4",       
                        name: "Mediterranean",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f5",       
                        name: "Mexican",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f6",       
                        name: "Moroccan",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f7",       
                        name: "Mughlai",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f8",       
                        name: "North Indian",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59f9",       
                        name: "South Indian",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59fa",       
                        name: "Spanish",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                         _id: "5a5342a9c6363e11949a59fb",       
                        name: "Turkish",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59fc",       
                        name: "Japanese",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59fd",    
                        name: "European",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59fe",      
                        name: "Sea Food",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59ff",      
                        name: "Fast Food",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a00",      
                        name: "Kashmiri",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a01",      
                        name: "Asian",                        
                        aminityId :"5a533795d8d2095818be8a26"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a02",      
                        name: "Catering",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a03",      
                        name: "Wifi",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a04",      
                        name: "Smoking Area",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a05",      
                        name: "Valet Parking",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a06",      
                        name: "Live Screening",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a07",      
                        name: "Shisha",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a08",      
                        name: "Outdoor dining/ Alfresco",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a09",      
                        name: "Bar",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a0a",      
                        name: "Home Delivery",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a0b",      
                        name: "Live Music ",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a0c",      
                        name: "Buffet",                        
                        aminityId :"5a533795d8d2095818be8a27"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a0d",     
                        name: "Facial",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a0e",      
                        name: "Bleach",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a0f",      
                        name: "De-tan",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a10",     
                        name: "Face Massage",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a11",      
                        name: "Face Scrub ",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a12",      
                        name: "Threading",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a13",      
                        name: "Cleansing",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a14",       
                        name: "Face pack",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a15",     
                        name: "Neck Massage",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a16",      
                        name: "Waxing",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a17",      
                        name: "Full body waxing",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a19",      
                        name: "Half Legs Waxing",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a59fc",      
                        name: "Half Arms Waxing",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a1a",      
                        name: "Full Arms Waxing",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a1b",      
                        name: "Full Legs",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a1c",      
                        name: "Manicure",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a1d",      
                        name: "Pedicure",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a1e",      
                        name: "Face Massage",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a1f",      
                        name: "Head Massage",                        
                        aminityId :"5a533795d8d2095818be8a28"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a20",     
                        name: "Hair Spa",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a21",      
                        name: "Hair Color",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a22",      
                        name: "Hair Cut",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a23",      
                        name: "Shampoo",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a24",      
                        name: "Conditioner",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a25",      
                        name: "Blow Dry",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a26",      
                        name: "Head Massage",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a27",      
                        name: "Trimming",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a28",      
                        name: "Hair do",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a29",      
                        name: "Hair Rebonding",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a2a",      
                        name: "Smoothening",                        
                        aminityId :"5a533795d8d2095818be8a29"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a2b",      
                        name: "Nail Art",                        
                        aminityId :"5a533795d8d2095818be8a2a"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a2c",      
                        name: "Nail Extension",                        
                        aminityId :"5a533795d8d2095818be8a2a"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a2d",      
                        name: "Permanent Extension",                        
                        aminityId :"5a533795d8d2095818be8a2a"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a2e",      
                        name: "Tattoo",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a2f",     
                        name: "Tattoo Removal",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a30",      
                        name: "Color Tattoo",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a31",      
                        name: "Black&White Tattoo",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a32",      
                        name: "Permanent Tattoo",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a33",      
                        name: "Temporary Tattoo",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a34",      
                        name: "Piercing",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                       _id: "5a5342a9c6363e11949a5a35",       
                        name: "Nose Piercing",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a36",      
                        name: "Ear Piercing",                        
                        aminityId :"5a533795d8d2095818be8a2b"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a37",     
                        name: "Services at Doorstep",                        
                        aminityId :"5a533795d8d2095818be8a2c"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a38",      
                        name: "Bridal Makeup",                        
                        aminityId :"5a533795d8d2095818be8a2d"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a39",      
                        name: "Party Makeup",                        
                        aminityId :"5a533795d8d2095818be8a2d"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a3a",      
                        name: "Hair Styling",                        
                        aminityId :"5a533795d8d2095818be8a2d"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a3b",      
                        name: "Grooming",                        
                        aminityId :"5a533795d8d2095818be8a2d"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a3c",      
                        name: "Saree Drapping",                        
                        aminityId :"5a533795d8d2095818be8a2d"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a3d",      
                        name: "Ladies Only",                        
                        aminityId :"5a533795d8d2095818be8a2e"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a3e",      
                        name: "Gents Only",                        
                        aminityId :"5a533795d8d2095818be8a2e"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a3f",      
                        name: "Unisex",                        
                        aminityId :"5a533795d8d2095818be8a2e"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a40",      
                        name: "Doorstep Services",                        
                        aminityId :"5a533795d8d2095818be8a2f"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a41",      
                        name: "Full body massage",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a42",      
                        name: "Foot Massage",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a43",      
                        name: "Face Massage",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a44",      
                        name: "Head Massage",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a45",      
                        name: "Steam",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a46",     
                        name: "Shower",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a47",      
                        name: "Hot Towel",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a48",      
                        name: "Full body Scrub",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a49",      
                        name: "Face Scrub",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a4a",     
                        name: "Back Massage",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a4b",      
                        name: "Face Pack",                        
                        aminityId :"5a533795d8d2095818be8a30"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a4c",      
                        name: "Ayurvedic Massage",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a4d",      
                        name: "Deep Tissue Massage",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a4e",     
                        name: "Sports Massage",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a4f",      
                        name: "Thai Massage",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a50",      
                        name: "Swedish Massage",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a51",      
                        name: "Lomi Lomi Massage",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a52",      
                        name: "Rekki",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a53",      
                        name: "Therapeutic Massage",                        
                        aminityId :"5a533795d8d2095818be8a31"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a54",      
                        name: "Cross Gender",                        
                        aminityId :"5a533795d8d2095818be8a32"
                    },
                    {               
                        _id: "5a5342a9c6363e11949a5a55",     
                        name: "No Cross Gender",                        
                        aminityId :"5a533795d8d2095818be8a32"
                    }                    
                ]
                objectArray.forEach(function (element) {
                    var subAmenityType = new SubAmenityType(element);
                    subAmenityType.save(function (err) {
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
                    password : "12345678",
                    firstName : "Super",
                    lastName : "Admin",
                    gender : "Male",                                   
                    roleId : "584e7514df689623c3b0e039",
                    avatar : "Default.jpg",
                    isManual: true                  
                },
                {                                       
                    username : "ram@test.com",
                    password : "12345678",
                    firstName : "Ram",
                    lastName : "test",
                    gender : "Male",                                       
                    roleId : "584e7514df689623c3b0e039",
                    avatar : "Default.jpg",
                    isManual: true                    
                },
                {                                  
                    username : "ram@merchant.com",
                    password : "12345678",
                    firstName : "Ram",
                    lastName : "merchant",
                    gender : "Male",
                    roleId : "584e7514df689623c3b0e037",
                    avatar : "Default.jpg",
                    isManual: true                    
                },
                {                                  
                    username : "ram@merchantadmin.com",
                    password : "12345678",
                    firstName : "Ram",
                    lastName : "merchantadmin",
                    gender : "Male",                                     
                    roleId : "584e7514df689623c3b0e038",
                    avatar : "Default.jpg",
                    isManual: true                   
                },
                {                                  
                    username : "ram@client.com",
                    password : "12345678",
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

module.exports = yoz;
