var loginV1TestFragment = require('./loginV1Test');
var logoutV1TestFragment = require('./logoutV1Test');
var forgotPwdV1TestFragment = require('./forgotPwdV1Test');
var resetPwdV1TestFragment = require('./resetPwdV1Test');

module.exports = function () {
    describe('Login V1 Test', loginV1TestFragment);
    describe('Logout V1 Test', logoutV1TestFragment);
    describe('Forgot password V1 Test', forgotPwdV1TestFragment);    
    describe('Reset password V1 Test', resetPwdV1TestFragment);
}