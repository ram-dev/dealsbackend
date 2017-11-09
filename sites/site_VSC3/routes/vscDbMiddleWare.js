module.exports = function getRepo(req, res, next) {
    var db = require(__base).Repository.get('vsc');
    req.vsc = {
        db: db,
    };
    next();
};