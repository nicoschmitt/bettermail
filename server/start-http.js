(function(){
    
    var httpsRedirect = function(req, res, next) {
        if (req.headers['x-forwarded-proto'] != 'https' && !req.headers['x-arr-ssl']) {
            return res.redirect(301, 'https://' + req.hostname + req.originalUrl);
        } else {
            return next();
        }
    };
    
    module.exports.forceHttps = function(app) {
        var env = process.env.NODE_ENV;
        if (env != "development") {
            // force https 
            app.use(httpsRedirect);
        }
    }
    
    module.exports.start = function(app) {
        
        var server = {};
        console.log("Env: " + process.env.NODE_ENV)
        var env = process.env.NODE_ENV;
        var port = process.env.PORT || 8080;
        if (env == "development") {
            // start a local https server
            var fs = require('fs');
            var https = require('https');
            var options = {
                key  : fs.readFileSync('./certs/dev.cert.key'),
                cert : fs.readFileSync('./certs/dev.cert.crt')
            };
            server = https.createServer(options, app);
            port = 443;
        } else {
            var http = require('http');
            server = http.createServer(app);
        }

        server.listen(port, process.env.IP || "0.0.0.0", function() {
            var addr = server.address();
            console.log("Server listening at", addr.address + ":" + addr.port);
        });
    }

}());
