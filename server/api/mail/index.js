(function(){
    
    var express = require('express');
    var router = express.Router();
    var authRequired = require("../../auth/auth.utils").authRequired;
    var authUserRequired = require("../../auth/auth.utils").authUserRequired;

    var controller = require('./mail.controller');
  
    router.get('/', authUserRequired, controller.getallmails);
    router.get("/asset", controller.asset);
    router.get('/:id', authUserRequired, controller.getmail);
    router.delete("/:id", authUserRequired, controller.delete);

    module.exports = router;
    
}());