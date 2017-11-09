var logger = require(__base + '/lib/util/logger');
const USER_RESPONSE ={
    ERROR_WRONG_USERNAME_PASSWORD:"Wrong username or password.",
    ERROR_ACCESS_DENIED:"Access denied",
    ERROR_NOT_ACCEPTABLE:"Not Acceptable"
}
/**
 * Send status code 401 as response, body contains error parameter
 * with description "Wrong username or password". 
 * @param  {Object} res
 */
var wrongUsernameOrPassword = function (res, msg) {
    var message = USER_RESPONSE.ERROR_WRONG_USERNAME_PASSWORD;
    logger.error(message);
    res.status(401).json({ error: message });
};
/**
 * Send status code 500 as response, body contains error parameter
 * with description put in the input param error.
 * @param  {object} res
 * @param  {String} error - the error message
 */
var unexpectedError = function (res, error) {  
    logger.error(error);
    res.status(500).json({ error: error.message });
};
/**
 * Send status code 403 as response, body contains error parameter
 * with description "Access denied"
 * @param  {Object} res
 * @param  {Object} [message=Access denied] message - message to add in the body
 */
var accessDenied = function (res, message) {
    if (!message) {
        message = USER_RESPONSE.ERROR_ACCESS_DENIED;
    }
    logger.error(message);
    res.status(403).json({ error: message });
};
/**
 * Send status code 406 as response, body contains error parameter
 * with description "Not Accessable".
 * @param  {Object} res
 */
var notAcceptable = function (res) {
    var message = USER_RESPONSE.ERROR_NOT_ACCEPTABLE;
    logger.error(message);
    res.status(406).json({ error: message });
};
/**
 * Send status code 400 as response, body contains error parameter
 * with description put in message param.
 * @param  {Object} res
 * @param  {String} message
 */
var badRequest = function (res, error) {    
    var message;
    if(error.message){
        logger.error(error);
        message = error.message;
    }else{
        message = error;
        logger.error(message);
    }    
    res.status(400).json({ error: message });
}
/**
 * Sends status code 200 as resonse, 
 * @param  {Object} res
 * @param  {Object} body
 */
var OK = function (res, body) {    
    res.status(200).json(body);
}
/**
 * Send status code 404 as response, body contains error parameter
 * with description put in message param.
 * @param  {Object} res
 * @param  {String} message
 */
var notFound = function (res, message) {
    logger.error(message);
    res.status(404).json({ error: message });
}
/**
 * Send status code 409 as response, body contains error parameter
 * with description put in message param.
 * @param  {} res
 * @param  {} message
 */
var conflict = function (res, message) {
    logger.error(message);
    res.status(409).json({ error: message });
}

/**
 * Send status code 401 as response, body contains error parameter
 * with description puted in message param.
 * @param  {} res
 * @param  {} message
 */
var unAuthorized =  function(res, message){
    logger.error(message);
    res.status(401).json({ error: message });
}

module.exports.wrongUsernameOrPassword = wrongUsernameOrPassword;
module.exports.unexpectedError = unexpectedError;
module.exports.notAcceptable = notAcceptable;
module.exports.accessDenied = accessDenied;
module.exports.badRequest = badRequest;
module.exports.notFound = notFound;
module.exports.conflict = conflict;
module.exports.OK = OK;
module.exports.unAuthorized = unAuthorized
