var async = require('async');
var restHelper = require('../../../util/restHelper');
var passport = require('../../../controllers/passport');
var dbModels = require('../../../util/dbModels');

const STRINGS = {
    DEBUG_LOGOUT_SUCCESS: "yoz-Frontend Logout API and successfully logout %s"
}

module.exports = {
    use: function (Router) {
        Router.post('/v1/logout', Post());
    }
};

/**
 * create a cain of rules for loging out a user. 
 * @return Array of functions for the Router.
 */
function Post() {
    return [
        passport.isBearerAndMerchantOrMerchantAdminOrSuperAdmin,
        function checkHeader(req, res) {
            var user = req.user;
            var Token = req.yoz.db.model(dbModels.tokenModel);          
            Token.remove({userId: user._id}, function (err) {
                if (err) {
                    restHelper.unexpectedError(res, err);
                    return;
                }
                req.logger.debug(STRINGS.DEBUG_LOGOUT_SUCCESS, user.username);
                res.status(200).json({});
                return;
            });
        }
    ];
}
