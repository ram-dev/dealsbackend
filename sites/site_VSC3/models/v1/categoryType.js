var mongoose = require('mongoose');
var dbModels = require('../../util/dbModels');

var Schema = mongoose.Schema;

/*var CategoryTypeSchema = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true},
    subcategories:[{
        name:{type:Schema.Types.String},
        subcategories :[{
            name:{type:Schema.Types.String},
        }]
    }]
});*/

var maincat_Food_Beverages = "5a290b2d539eb0b14cd91d0c";
var maincat_Wellness = "5a290b84539eb0b14cd91d1a";
var maincat_Services = "5a290c8f539eb0b14cd91d3d";
var maincat_E_Shopping = "5a290c83539eb0b14cd91d39";
var maincat_Entertainment = "57d900c2df896e82ac1f8548";
var maincat_Travel = "5a290c78539eb0b14cd91d37";
var maincat_SPA = "5a290ba6539eb0b14cd91d1f";
var cat_Fine_Dine = "5a2919f13fee7034a0fad59f";
var cat_Bakery_Fast_Food = "5a2919f13fee7034a0fad59d";
var cat_Cafe_Confectionery = "5a2919f13fee7034a0fad59c";
var cat_Bar_Pub_Lounge = "5a2919f13fee7034a0fad59e";
var cat_Salon = "5a2919f13fee7034a0fad5a2";
var cat_Zumba_Yoga_Aerobics = "5a2919f13fee7034a0fad5a1";
var cat_Photography_Printing = "5a2919f13fee7034a0fad5b4";
var cat_E_Com_Online_Services = "5a2919f13fee7034a0fad5b0";
var cat_International = "5a2919f13fee7034a0fad5a8";
var cat_Spa_Services = "5a2919f13fee7034a0fad5a3";
var cat_Car_Wash = "5a2919f13fee7034a0fad5b7";
var cat_Health_Fitness = "5a2919f13fee7034a0fad5a0";
var cat_Flower_Cake_Delivery = "5a2919f13fee7034a0fad5b2";
var cat_Astrology = "5a2919f13fee7034a0fad5b5";
var cat_Pest_Control = "5a2919f13fee7034a0fad5b6";
var cat_Theatre_Movies = "5a2919f13fee7034a0fad5a7";
var cat_Training_Coaching_Classes = "5a2919f13fee7034a0fad5b1";
var cat_Domestic_Hotels = "5a2919f13fee7034a0fad5af";
var cat_Amusement_Park = "5a2919f13fee7034a0fad5a5";
var cat_International_Holiday_Packages = "5a2919f13fee7034a0fad5aa";
var cat_Games_Live_Events_Concerts = "5a2919f13fee7034a0fad5a6";
var cat_Domestic_Airfare_Tickets = "5a2919f13fee7034a0fad5ad";
var cat_Domestic_Holiday_Packages = "5a2919f13fee7034a0fad5ae";
var cat_International_Airfare_Tickets = "5a2919f13fee7034a0fad5a9";
var cat_Music_Dance_Classes = "5a2919f13fee7034a0fad5b3";
var cat_Domestic = "5a2919f13fee7034a0fad5ac";
var cat_International_Hotels = "5a2919f13fee7034a0fad5ab";
var cat_eShoping = "5a2919f13fee7034a0fad5a4";


var CategoryTypeSchema = module.exports = new Schema({
    name: {type: Schema.Types.String, required: true},    
    parent:{ type: Schema.Types.ObjectId, ref : dbModels.categoryType},
    ancestors :[{
        type: Schema.Types.ObjectId, ref : dbModels.categoryType
    }],
    created: { type: Number, required: true, default: Date.now },
    updated: { type: Number, required: true, default: Date.now },
});

var name = dbModels.categoryType;
module.exports.name = name;

module.exports.MainCategoryTypes = {
    maincat_Food_Beverages: maincat_Food_Beverages,
    maincat_Wellness: maincat_Wellness,
    maincat_Services: maincat_Services,
    maincat_E_Shopping: maincat_E_Shopping,
    maincat_Entertainment: maincat_Entertainment,
    maincat_Travel: maincat_Travel,
    maincat_SPA: maincat_SPA    
};

module.exports.SubCategoryTypes = {
    cat_Fine_Dine: cat_Fine_Dine,
    cat_Bakery_Fast_Food: cat_Bakery_Fast_Food,
    cat_Cafe_Confectionery: cat_Cafe_Confectionery,
    cat_Bar_Pub_Lounge: cat_Bar_Pub_Lounge,
    cat_Salon: cat_Salon,
    cat_Zumba_Yoga_Aerobics: cat_Zumba_Yoga_Aerobics,
    cat_Photography_Printing: cat_Photography_Printing,
    cat_E_Com_Online_Services: cat_E_Com_Online_Services,
    cat_International: cat_International,
    cat_Spa_Services: cat_Spa_Services,
    cat_Car_Wash: cat_Car_Wash,
    cat_Health_Fitness: cat_Health_Fitness,
    cat_Flower_Cake_Delivery: cat_Flower_Cake_Delivery, 
    cat_Astrology: cat_Astrology,
    cat_Pest_Control: cat_Pest_Control,
    cat_Theatre_Movies: cat_Theatre_Movies,
    cat_Training_Coaching_Classes: cat_Training_Coaching_Classes,
    cat_Domestic_Hotels: cat_Domestic_Hotels,
    cat_Amusement_Park: cat_Amusement_Park,
    cat_International_Holiday_Packages: cat_International_Holiday_Packages,
    cat_Games_Live_Events_Concerts: cat_Games_Live_Events_Concerts,
    cat_Domestic_Airfare_Tickets: cat_Domestic_Airfare_Tickets,
    cat_Domestic_Holiday_Packages: cat_Domestic_Holiday_Packages,
    cat_International_Airfare_Tickets: cat_International_Airfare_Tickets,
    cat_Music_Dance_Classes: cat_Music_Dance_Classes, 
    cat_Domestic: cat_Domestic,
    cat_International_Hotels: cat_International_Hotels,
    cat_eShoping: cat_eShoping
};
