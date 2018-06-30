var Express = require('express');
var yozRepo = require('./yozDbMiddleWare');

module.exports = {
    createRoutes: function(express) {
       
        var frontendRouter = Express.Router();
        var adminRouter = Express.Router();
       
        setupDefaultMiddleWare(frontendRouter);
        setupDefaultMiddleWare(adminRouter);
       
        populateFrontendAPI(frontendRouter);
        populateAdminAPI(adminRouter);
       
        express.use('/frontend/api', frontendRouter);
        express.use('/admin/api', adminRouter);

        return [            
            {
                api: '/frontend/api',
                router: frontendRouter
            },
            {
                api: '/admin/api',
                router: adminRouter
            }
        ];
    }
};

function setupDefaultMiddleWare (Router) {
    Router.all('*', yozRepo);    
};

/**
 * populates the Admin router with routes.
 * @param  {} adminRouter the router to populate. 
 */
function populateAdminAPI(adminRouter){
    var LoginRoute = require('./adminAPI/v1/loginRoute');
    //var RegisterRoute = require('./adminAPI/v1/registerRoute');
    var LogoutRoute = require('./adminAPI/v1/logoutRoute');
    var ForgotPwdRoute = require('./adminAPI/v1/forgotPwdRoute');
    var ResetPwdRoute = require('./adminAPI/v1/resetPwdRoute');
    var UserRoute = require('./adminAPI/v1/userRoute');
    var MerchantAdminRoute = require('./adminAPI/v1/merchantAdminRoute');
    var DealAdminRoute = require('./adminAPI/v1/dealAdminRoute');
    var OutletAdminRoute = require('./adminAPI/v1/outletAdminRoute');

    LoginRoute.use(adminRouter);
    //RegisterRoute.use(adminRouter);
    ForgotPwdRoute.use(adminRouter);
    ResetPwdRoute.use(adminRouter);
    LogoutRoute.use(adminRouter);
    UserRoute.use(adminRouter);
    MerchantAdminRoute.use(adminRouter);
    DealAdminRoute.use(adminRouter);
    OutletAdminRoute.use(adminRouter);
}

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
    var InternalRoute = require('./frontendAPI/v1/internalRoute');
    var MerchantStatRoute = require('./frontendAPI/v1/merchantStatRoute');
    var CountryRoute = require('./frontendAPI/v1/countryRoute');
    var PublicDealRoute = require('./frontendAPI/v1/publicDealRoute');

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
    InternalRoute.use(frontendRouter);
    MerchantStatRoute.use(frontendRouter);
    CountryRoute.use(frontendRouter);
    PublicDealRoute.use(frontendRouter);
};
