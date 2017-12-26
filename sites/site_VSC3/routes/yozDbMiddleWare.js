module.exports = function getRepo(req, res, next) {
    var db = require(__base).Repository.get('yoz');
    req.yoz = {
        db: db,
    };
    next();
};