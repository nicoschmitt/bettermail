(function(){
    
    var express = require('express');
    var router = express.Router();
    var authRequired = require("../../auth/auth.utils").authRequired;
    var authUserRequired = require("../../auth/auth.utils").authUserRequired;

    var controller = require('./mail.controller');
  
    router.get('/', authUserRequired, controller.getallmails);
    router.get('/debug', authUserRequired, controller.debug);
    router.get("/asset", controller.asset);
    router.get('/:id', authUserRequired, controller.getmail);
    router.delete("/:id", authUserRequired, controller.delete);
    router.post("/", authUserRequired, controller.create);
    router.options("/:id", authUserRequired, controller.replyinfo);
    router.post("/:id", authUserRequired, controller.reply);

    module.exports = router;
    
}());