(function(){
    
    var express = require('express');
    var router = express.Router();
    
    var controller = require('./auth.controller');
    var authRequired = require("./auth.utils").authRequired;
  
    router.post('/login', controller.login);
    router.get('/renew', authRequired, controller.renew);

    module.exports = router;
    
}());
