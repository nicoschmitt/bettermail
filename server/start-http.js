(function(){
    
    module.exports.start = function(app) {
        
        var server = {};
        var env = process.env.NODE_ENV || "development";
        var port = process.env.PORT || 8080;
        if (env == "development") {
            console.log("Dev env, start HTTPS server");
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
