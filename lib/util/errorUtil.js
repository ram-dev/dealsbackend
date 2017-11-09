
/**
 *  Iterates through an error object and creates a complete error description in a string.
 *  Also updates the err.message to the new more detailed string.
 * 
 */
module.exports.getErrorDesc = function (err) {
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
};