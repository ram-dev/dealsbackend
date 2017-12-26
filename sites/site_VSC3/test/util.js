var util = {};
util.yoz = {};

util.url = 'http://localhost:3000';
util.yoz.anon = {};
util.yoz.anon.v1_Url = util.url + '/yoz/anon-api/1.0';
util.yoz.anon.v2_Url = util.url + '/yoz/anon-api/2.0';
util.yoz.anon.v3_Url = util.url + '/yoz/anon-api/3.0';

util.yoz.auth = {};
util.yoz.auth.v1_Url = util.url + '/yoz/user-auth-api/1.0';
util.yoz.auth.v2_Url = util.url + '/yoz/user-auth-api/2.0';
util.yoz.auth.v3_Url = util.url + '/yoz/user-auth-api/3.0';

util.yoz.details = {};
util.yoz.details.v1_Url = util.url + '/yoz/user-details-api/1.0';

util.yoz.v1_Url = util.url + '/yoz/api/1.0';
util.yoz.v2_Url = util.url + '/yoz/api/2.0';
util.yoz.v3_Url = util.url + '/yoz/api/3.0';

util.frontend = {};
util.frontend.v1_Url = util.url + '/frontend/api';

module.exports = util;