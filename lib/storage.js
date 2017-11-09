var fs = require('fs');

var StoragePath = __dirname + "/storage";
var UsersPath = StoragePath + "/users";
var AvatarsPath = UsersPath + "/avatars"; 
var LookupPath = StoragePath + "/lookup";

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

module.exports = {
    StoragePath: StoragePath,
    UsersPath: UsersPath,
    AvatarsPath: AvatarsPath,
    LookupPath: LookupPath
}
