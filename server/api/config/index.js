(function(){

    var express = require('express');
    var extractAuth = require("../../auth/auth.utils").extractAuth;
    var User = require("../../auth/user.model");
    
    var router = express.Router();
    
    var getConfig = function(req, res) {
      res.json({ 
          env: process.env.NODE_ENV
      });
    };
    
    var info = function(req, res) {
        var info = {
            node_env: process.env.NODE_ENV
        };
        var auth = extractAuth(req);
        if (auth.auth) {
            User.findById(auth.user, function(err, user) {
                info.username = user.name;
                info.fulluser = user;
                res.json(info);
            });
        } else {
            res.json(info);
        }
    };
   
    router.get('/', getConfig);
    router.get("/info", info);
    
    module.exports = router;
    
}());
