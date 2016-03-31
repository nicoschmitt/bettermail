(function(){
    
    module.exports.getmail = function(req, res) {
        console.log(req.user);
        res.json({status: "ok"});
    };
    
}());
