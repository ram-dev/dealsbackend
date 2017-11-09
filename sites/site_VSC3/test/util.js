var util = {};
util.vsc = {};

util.url = 'http://localhost:3000';
util.vsc.anon = {};
util.vsc.anon.v1_Url = util.url + '/vsc/anon-api/1.0';
util.vsc.anon.v2_Url = util.url + '/vsc/anon-api/2.0';
util.vsc.anon.v3_Url = util.url + '/vsc/anon-api/3.0';

util.vsc.auth = {};
util.vsc.auth.v1_Url = util.url + '/vsc/user-auth-api/1.0';
util.vsc.auth.v2_Url = util.url + '/vsc/user-auth-api/2.0';
util.vsc.auth.v3_Url = util.url + '/vsc/user-auth-api/3.0';

util.vsc.details = {};
util.vsc.details.v1_Url = util.url + '/vsc/user-details-api/1.0';

util.vsc.v1_Url = util.url + '/vsc/api/1.0';
util.vsc.v2_Url = util.url + '/vsc/api/2.0';
util.vsc.v3_Url = util.url + '/vsc/api/3.0';

util.frontend = {};
util.frontend.v1_Url = util.url + '/frontend/api';

module.exports = util;