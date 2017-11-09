var mongoose = require('../../data/repository');
var dbModels = require('../../util/dbModels');
var keygen = require("keygenerator");
var RoleSchema = require('../../models/v1/roleModel');
var User = mongoose.model(dbModels.userModel);
var Token = mongoose.model(dbModels.tokenModel);
var async = require('async');
var scenario = module.exports = {
    create: function (done) {
        async.waterfall([            
            createSuperAdmin,
            createMerchantAdmin,   
            createMerchant,
            createMerchant2,
            createMerchant3,
            createClient         
        ], function (err, results) {
            if (err) {
                throw new Error(err.message);
            }
            done();
        });
    },
    createToken: function (user, done) {
        var newToken = new Token({
            value: keygen.session_id(),
            userIp: "::ffff:127.0.0.1",
            userId: user._id
        });
        newToken.save(function (err) {
            if (err) {
                throw new Error(err.message);
            }
            user.token = newToken;
            done();
        });
    },
    destroy: function (done) {
        async.parallel([
            destroyClient,           
            destroyMerchantAdmin,
            destroyMerchant,
            destroyMerchant2,
            destroyMerchant3,
            destroySuperAdmin,           
            destroyTokens            
        ], function (err, results) {
            if (err) {
                throw new Error(err.message);
            }
            done();
        });
    }
};

function createClient(callback) {
    var client = new User({
        username: "client1@mail.com",
        password: "qwerty",
        firstName: "TestUser1",
        lastName: "Testsson",
        contacts: {
            address1: "per udens väg",
            address2: "storgatan 12",
            zip: "2345678",
            city: "Timrå",
            state: "ddd",
            country: "Sweden",
            phone1: "34567890876",
            phone2: "34567890876",
            fax: "456789098765"
        },
        gender: "Male",
        birthDate: "1993-03-13",        
        roleId: RoleSchema.Types.ClientRole
    });
    client._omitLog = true;
    scenario.client = client;
    client.save(function (err, c) {
        if (err) {
            throw err;
        } 
        callback();       
    });
};

function createMerchant(callback) {
    var merchant = new User({
        username: "merchant1@mail.com",
        password: "qwerty",
        firstName: "TestClinician3",
        lastName: "Testsson",
        gender: "Male",
        birthDate: "1993-03-13",
        contacts: {
            address1: "My street 12",
            address2: "storgatan 12",
            zip: "123345",
            city: "Stockholm",
            state: "ddd",
            country: "Sweden",
            phone1: "456789056789",
            phone2: "34567890876",
            fax: "456789098765"
        },
        roleId: RoleSchema.Types.MerchantRole,
        created_By: scenario.superAdmin._id
    });
    merchant._omitLog = true;
    scenario.merchant = merchant;
    merchant.save(function (err) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

function createMerchant2(callback) {
    var merchant = new User({
        username: "merchant2@mail.com",
        password: "qwerty",
        firstName: "TestClinician3",
        lastName: "Testsson",
        gender: "Male",
        birthDate: "1993-03-13",
        contacts: {
            address1: "My street 12",
            address2: "storgatan 12",
            zip: "123345",
            city: "Stockholm",
            state: "ddd",
            country: "Sweden",
            phone1: "456789056789",
            phone2: "34567890876",
            fax: "456789098765"
        },
        roleId: RoleSchema.Types.MerchantRole,
        created_By: scenario.superAdmin._id
    });
    merchant._omitLog = true;
    scenario.merchant2 = merchant;
    merchant.save(function (err) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

function createMerchant3(callback) {
    var merchant = new User({
        username: "merchant3@mail.com",
        password: "qwerty",
        firstName: "TestClinician3",
        lastName: "Testsson",
        gender: "Male",
        birthDate: "1993-03-13",
        contacts: {
            address1: "My street 12",
            address2: "storgatan 12",
            zip: "123345",
            city: "Stockholm",
            state: "ddd",
            country: "Sweden",
            phone1: "456789056789",
            phone2: "34567890876",
            fax: "456789098765"
        },
        roleId: RoleSchema.Types.MerchantRole,
        created_By: scenario.superAdmin._id
    });
    merchant._omitLog = true;
    scenario.merchant3 = merchant;
    merchant.save(function (err) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

function createSuperAdmin(callback) {
    var superAdmin = new User({
        username: "superAdmin1@mail.com",
        password: "qwerty",
        firstName: "TestSuperAdmin",
        lastName: "Testsson",
        contacts: {
            address1: "Rosenbad street",
            address2: "storgatan 12",
            zip: "43243423543432",
            city: "Stockholm",
            state: "ddd sd",
            country: "Sweden",
            phone1: "4325343423423",
            phone2: "34567890876",
            fax: "456789098765"
        },        
        gender: "Male",
        birthDate: "1993-03-13",        
        roleId: RoleSchema.Types.SuperAdminRole
    });
    superAdmin._omitLog = true;
    scenario.superAdmin = superAdmin;
    superAdmin.save(function (err) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};


function createMerchantAdmin(callback) {
    var merchantAdmin = new User({
        username: "merchantAdmin1@mail.com",
        password: "qwerty",
        firstName: "TestSuperAdmin",
        lastName: "Testsson",
        contacts: {
            address1: "my sdfsds treet",
            address2: "adsdf 12",
            zip: "43243543432",
            city: "Stockholm",
            state: "ddd sd",
            country: "Sweden",
            phone1: "4325343423423",
            phone2: "34567890876",
            fax: "4567898765"
        },        
        gender: "Male",
        birthDate: "1993-03-13",       
        roleId: RoleSchema.Types.MerchantAdminRole,
        created_By: scenario.superAdmin._id
    });
    merchantAdmin._omitLog = true;
    scenario.merchantAdmin = merchantAdmin;
    merchantAdmin.save(function (err) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

function destroyClient(callback) {
    scenario.client.remove(callback);
};
function destroySuperAdmin(callback) {
    scenario.superAdmin.remove(callback);
}
function destroyMerchantAdmin(callback) {
    scenario.merchantAdmin.remove(callback);
};
function destroyMerchant(callback) {
    scenario.merchant.remove(callback);
};
function destroyMerchant2(callback) {
    scenario.merchant2.remove(callback);
};
function destroyMerchant3(callback) {
    scenario.merchant3.remove(callback);
};
function destroyTokens(callback) {
    Token.remove({}, callback);
};
