module.exports = function (req, res, next) {
    var requestIp = req.connection.remoteAddress;
    if (requestIp !== 'localhost' && requestIp !== '::ffff:127.0.0.1' && requestIp !== '::1') {
        return res.status(403).json({ error: "only localhosts are allowed to use this api" });
    }
    else {
        next();
    }
}