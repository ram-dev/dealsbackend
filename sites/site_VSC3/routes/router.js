var Express = require('express');
var yozRepo = require('./yozDbMiddleWare');

module.exports = {
    createRoutes: function(express) {
       
        var frontendRouter = Express.Router();
       
        setupDefaultMiddleWare(frontendRouter);
       
        populateFrontendAPI(frontendRouter);
       
        express.use('/frontend/api', frontendRouter);

        return [            
            {
                api: '/frontend/api',
                router: frontendRouter
            }
        ];
    }
};

function setupDefaultMiddleWare (Router) {
    Router.all('*', yozRepo);    
};


/**
 * populates the Frontend router with routes.
 * @param  {} frontendRouter the router to populate. 
 */
function populateFrontendAPI(frontendRouter) {
    var LoginRoute = require('./frontendAPI/v1/loginRoute');
    var RegisterRoute = require('./frontendAPI/v1/registerRoute');
    var LogoutRoute = require('./frontendAPI/v1/logoutRoute');   
    var ForgotPwdRoute = require('./frontendAPI/v1/forgotPwdRoute');
    var ResetPwdRoute = require('./frontendAPI/v1/resetPwdRoute');
    var MerchantRoute = require('./frontendAPI/v1/merchantRoute');
    var OutletRoute = require('./frontendAPI/v1/outletRoute');
    var UserRoute = require('./frontendAPI/v1/userRoute');
    var DealRoute = require('./frontendAPI/v1/dealRoute');
    var DownloadDealRoute = require('./frontendAPI/v1/downloadDealRoute');

    LoginRoute.use(frontendRouter);
    RegisterRoute.use(frontendRouter);
    ForgotPwdRoute.use(frontendRouter);
    ResetPwdRoute.use(frontendRouter);
    LogoutRoute.use(frontendRouter);
    MerchantRoute.use(frontendRouter);
    OutletRoute.use(frontendRouter);
    UserRoute.use(frontendRouter);
    DealRoute.use(frontendRouter);
    DownloadDealRoute.use(frontendRouter);
};
