var fs = require('fs');
var path = require('path');
require('../lib/util/date');
var Config = require('../config');
global.__base =  Config.basePath+ '/';

var excludes = [];



describe('Routing', function () {
	
	var dir = path.join(__dirname, "../sites");
	process.argv.forEach(function (val, index, array) {		
		if (val.startsWith("--exclude=")) {
			excludes.push(val.substr(10, val.length));
		}
	});
		
	fs.readdirSync(dir).forEach(function (file) {
		
		var siteDir = path.join(dir, file);
		
		if (!fs.statSync(siteDir).isDirectory()) {			
			return;
		}

		if( excludes.indexOf(file) > -1){
			console.log("skip " + file);			
			return;
		}

		var siteDirTestDir = path.join(siteDir, "test"); 
		
		if (!fs.statSync(siteDirTestDir).isDirectory()) {			
			return;
		}

		var test = require(siteDirTestDir);		
		describe(file, test);
	});
});


