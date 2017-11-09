var fs = require("fs");
var base  = __dirname;

var config = {};
const SERVER_ROLES = {
    Production: "production",
    Factory: "factory",
    Test: "test"
};

/** ------------------------------------------------------  Config for Ram test */
config.ram = {};
config.ram.server = {};
config.ram.server.port = 3000;
config.ram.server.serverRole = SERVER_ROLES.Test;

config.ram.factory = {};
config.ram.factory.host = "cwcprod.yofferz.com";
config.ram.factory.port = 8089

config.ram.db = {};

// Config for connection to Office365 SMTP
config.ram.smtp = {
    host: 'smtp.office365.com', port: 587,
    auth: {
        user: 'ramkumar.consult@gmail.com',
        pass: 'Ram'
    }
};

// SSL certificate
config.ram.certOptions = {
    ca: './serverCertificates/yofferz_com_sha256-ca.crt',
    key: './serverCertificates/yofferz_com_sha256.key',
    cert: './serverCertificates/yofferz_com_sha256.cer'
};
config.ram.NODE_ENV = "production" // development || production
config.ram.basePath = base;

config.ram.certificatesPatch = "/etc/yofferz/certs";
config.ram.certificatKeysPath = "/etc/yofferz/private";
config.ram.upgrade = {};
config.ram.upgrade.binariesPath = "/var/www/cwc_fileserver_ssl";
config.ram.upgrade.httpsUrl = "https://cwcprod.yofferz.com:443";




/** ------------------ Set current config on startup, based on --config argument */
var currentConfig = null;

process.argv.forEach(function (val, index, array) {
    if (val.startsWith("--config=")) {
        var sConfigEnv = val.substring(9, val.length);
        try {
            currentConfig = config[sConfigEnv];
            console.log("Setting config to " + sConfigEnv);
        } catch (err) {
            // Exit if something went wrong.
            console.log(err);
            console.log("Could not find configuration environment: " + sConfigEnv);
            return process.exit();
        }
    } else if (val.startsWith("--role=")) {
        var role = val.substring(7, val.length);
        try {
            config.server.serverRole = role;
        } catch (err) {
            console.log(err);
            console.log("Could not find configuration environment: " + sConfigEnv);
            return process.exit();
        }
    }
});
// If not set use prod
if (currentConfig == null) {
    currentConfig = config.ram;
    console.log("Launched without --config, setting config to PROD!");
}

console.log("Running on 1 " + currentConfig.server.serverRole + " role");

module.exports = currentConfig;
module.exports.ServerRoles = SERVER_ROLES;
