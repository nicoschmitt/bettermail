(function(){
    
    var express = require('express');
    var router = express.Router();
    var authRequired = require("../../auth/auth.utils").authRequired;
    var authUserRequired = require("../../auth/auth.utils").authUserRequired;

    var controller = require('./mail.controller');
  
    router.get('/', authUserRequired, controller.getmail);
    // router.get('/:userid', controller.userwall);
    // router.post('/', ensureAuthenticated, controller.create);
    // router.delete('/:pin', ensureAuthenticated, controller.remove);

    module.exports = router;
    
}());