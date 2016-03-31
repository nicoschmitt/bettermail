(function(){
    
    var register = function(app) {
        app.use('/api/config', require('./api/config'));
        app.use('/auth', require('./auth'));
        app.use('/api/mail', require('./api/mail'));
    };

    module.exports.register = register;

}());
