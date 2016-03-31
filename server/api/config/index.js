(function(){

    var express = require('express');
    var router = express.Router();
    
    var getConfig = function(req, res) {
      res.json({ 
          githubAppId: process.env.GITHUB_CLIENT_ID
      });
    };
   
    router.get('/', getConfig);
    
    module.exports = router;
    
}());
