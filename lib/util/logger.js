var winston = require('winston'),
    fs = require( 'fs' ),
    logDir = 'logs', 
    config = require('../../config'),
    env = config.NODE_ENV || 'development'; // Or read from a configuration
    

winston.setLevels( winston.config.npm.levels );
winston.addColors( winston.config.npm.colors );

if ( !fs.existsSync( logDir ) ) {
    // Create the directory if it does not exist
    fs.mkdirSync( logDir );
}

loggerAll = new( winston.Logger )( {
    transports: [
        new winston.transports.Console( {
            level: env === 'development' ? 'debug' : 'warn', // Only write logs of warn level or higher
            colorize: true
        } ),
        new winston.transports.File( {
            name: 'info-file',           
            level: 'info', 
            filename: logDir + '/all-logs.log',
            maxsize: 1024 * 1024 * 10 // 10MB
        } )        
    ],
    exceptionHandlers: [
        new winston.transports.File( {
            filename: 'log/exceptions.log'
        } )
    ]
} );

loggerDebug = new( winston.Logger )( {
    transports: [
        new winston.transports.Console( {
            level: env === 'development' ? 'debug' : 'warn', // Only write logs of warn level or higher
            colorize: true
        } ),       
        new winston.transports.File( {
            name: 'debug-file',           
            level: 'debug', 
            filename: logDir + '/debug-logs.log',
            maxsize: 1024 * 1024 * 10 // 10MB
        } )
    ],
    exceptionHandlers: [
        new winston.transports.File( {
            filename: 'log/exceptions.log'
        } )
    ]
} );

var Logger = {      
  debug: function(msg, logObject){    
    loggerDebug.debug(msg, logObject);
  },
  info: function(msg, logObject){     
    loggerAll.info(msg, logObject);
  },
  warn: function(msg, logObject){    
    loggerAll.warn(msg, logObject);
  },
  error: function(msg, logObject){     
    if(msg.message === undefined){
        loggerAll.error(msg, logObject);
    }else{
        var errorDesc = getErrorDesc(msg);
        loggerAll.error(errorDesc, logObject);
    }    
  },
  log: function(level, msg, logObject){    
    var lvl;
    if(level === 'debug'){
       lvl = loggerDebug[level];
    }else{
       lvl = loggerAll[level]
    }    
    lvl(msg, logObject);
  }
};

module.exports = Logger;
module.exports.stream = {
    write: function(message, encoding){
        Logger.info(message);
    }
};
module.exports.loggerMiddleware = function (req, res, next) {
   req.logger = Logger;
   next(); 
};

module.exports.exceptionMiddleware = function (err, req, res, next) {
   Logger.error(err.message, { stack: err.stack });
   next(err);
};

module.exports.logAndCrash = function (err) {
   Logger.error(err.message, { stack: err.stack });
   throw err;
}

/**
 *  Iterates through an error object and creates a complete error description in a string.
 *  Also updates the err.message to the new more detailed string.
 * 
 */
var getErrorDesc = function (err) {
    if (err instanceof Error) {
        var errorDesc = err.message;
        if ((err.errors != undefined) && (Object.keys(err.errors) != undefined)) {
            Object.keys(err.errors).forEach(function (field) {
                errorDesc += " : ";
                // Getting from .proprerties now.
                var eObj = err.errors[field];
                // console.log(eObj.message);
                errorDesc += eObj.message;
            }, this);
        }

        // console.log("--- " + errorDesc);
        err.message = errorDesc;

        return errorDesc;
    } else if (err instanceof String)
        return err;

    return "Unknown error";
}

