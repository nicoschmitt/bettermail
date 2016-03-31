(function(){
    
    var request = require("request");
    var qs      = require('querystring');
    var moment  = require("moment");
    var jwt     = require('jwt-simple');
    var User    = require("./user.model");
    
    function createJWT(user) {
        var payload = {
            sub: user._id,
            iat: moment().unix(),
            exp: moment().add(14, 'days').unix()
        };
        return jwt.encode(payload, process.env.TOKEN_SECRET);
    }
    
    module.exports.login = function(req, res) {
        console.log("login for " + req.body.name);
        
        var j = request.jar();
        request = request.defaults({ jar: j });
        request.get(process.env.HORDE_URL, function(error, response, body){
            if (error) {
                return res.status(500).send(error);    
            } else if (response.statusCode != 200) {
                console.log(response.statusCode);
                return res.status(401).send(body);
            }
            
            var hordeid = response.request.uri.query.split("=")[1];
      
            var url = process.env.HORDE_URL + "/imp/redirect.php";
            var form = {
                Horde: hordeid,
                actionID: "",
                url: "",	
                load_frameset: 1,
                autologin: 0,
                anchor_string: "",
                server_key: "imap",
                server: "imap",
                imapuser: req.body.name,
                pass: req.body.password,
                security_code: "nbjjy",
                new_lang: "en_US",
                select_view: "imp"  
            };
                
            j.setCookie(request.cookie('try=0'), url);
            request.post({ url: url, form: form, followAllRedirects: true}, function(error, response, body) {
                if (error) {
                    return res.status(500).send(error);    
                } else if (response.statusCode != 200) {
                    console.log(response.statusCode);
                    return res.status(401).send(body);
                } else if (response.request.uri.pathname == "/imp/login.php") {
                    return res.status(401).send("Invalid user name or password");
                }
                
                var newid = response.request.uri.query.substr("Horde=".length);
                hordeid = newid.substring(0, newid.indexOf("&"));
                
                User.findOne({ name: req.body.name }, function(err, existingUser) {
                    if (existingUser) {
                        existingUser.hordeid = hordeid;
                        existingUser.save(function(err, user) {
                            delete user.password;
                            res.json({ token: createJWT(user), user: user });
                        });
                    } else {
                        var user = new User({ 
                            name: req.body.name, 
                            password: req.body.password,
                            hordeid: hordeid
                        });
                        user.save(function(err, user) {
                            delete user.password;
                            res.json({ token: createJWT(user), user: user });
                        });
                    }
                });
            }); 
        });
    }
    
}());
