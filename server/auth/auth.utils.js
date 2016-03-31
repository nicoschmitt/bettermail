(function(){
    var jwt    = require('jwt-simple');
    var moment = require("moment");
    var User   = require("./user.model");
    
    function extractAuth(req) {
        if (!req.header('Authorization')) {
            return {
                auth: false, 
                user: null, 
                msg: 'Unauthorize'
            };
        }
        
        var token = req.header('Authorization').split(' ')[1];

        var payload = null;
        try {
            payload = jwt.decode(token, process.env.TOKEN_SECRET);
        }
        catch (err) {
            return {
                auth: false, 
                user: null, 
                msg: err.message
            };
        }

        if (payload.exp <= moment().unix()) {
            return {
                auth: false, 
                user: null, 
                msg: 'Token has expired'
            };
        }
        
        return {
            auth: true, 
            user: payload.sub, 
            msg: null
        };
    }
        
    module.exports.authRequired = function(req, res, next) {
        var auth = extractAuth(req);
        if (!auth.auth) {
            return res.status(401).send({ message: auth.msg });
        }
        
        req.user = auth.user;
        next();
    }
    
    module.exports.authUserRequired = function(req, res, next) {
        var auth = extractAuth(req);
        if (!auth.auth) {
            return res.status(401).send({ message: auth.msg });
        }
        
        User.findById(auth.user, function(err, user) {
            req.user = user;
            next();
        });
    }
   
}());
