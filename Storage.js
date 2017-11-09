var fs = require('fs');

var StoragePath = __dirname + "/storage";
var UsersPath = StoragePath + "/users";
var AvatarsPath = UsersPath + "/avatars"; 
var LookupPath = StoragePath + "/lookup";
var ImagePath = StoragePath + "/images";
var TermsPath = StoragePath + "/terms";

if( !fs.existsSync(StoragePath) ){
    console.log('Creating ' + StoragePath);
    fs.mkdirSync(StoragePath);
}

if( !fs.existsSync(UsersPath) ){
    console.log('Creating ' + UsersPath);
    fs.mkdirSync(UsersPath);
}

if( !fs.existsSync(AvatarsPath) ){
    console.log('Creating ' + AvatarsPath);
    fs.mkdirSync(AvatarsPath);
}

if( !fs.existsSync(LookupPath) ){
    console.log('Creating ' + LookupPath);
    fs.mkdirSync(LookupPath);
}

if( !fs.existsSync(TermsPath) ){
    console.log('Creating ' + TermsPath);
    fs.mkdirSync(TermsPath);
}



module.exports.StoragePath = StoragePath;
module.exports.UsersPath = UsersPath;
module.exports.AvatarsPath = AvatarsPath;
module.exports.LookupPath = LookupPath;
module.exports.TermsPath = TermsPath;
module.exports.ImagePath = ImagePath;
