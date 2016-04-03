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
    
    function login(user, pass, cbok, cbko) {
        var j = request.jar();
        var headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Upgrade-Insecure-Requests": 1,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.57 Safari/537.36",
            "Accept-Language": "fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4"
        };  
        var myrequest = request.defaults({ jar: j, headers: headers });
        myrequest.get(process.env.HORDE_URL, function(error, response, body){
            if (error) {
                return cbko(500, error);    
            } else if (response.statusCode != 200) {
                return cbko(401, body);
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
                imapuser: user,
                pass: pass,
                security_code: "nbjjy",
                new_lang: "en_US",
                select_view: "imp"  
            };
                
            j.setCookie(myrequest.cookie('try=0'), url);
            myrequest.post({ url: url, form: form, followAllRedirects: true}, function(error, response, body) {
                if (error) {
                    return cbko(500, error);    
                } else if (response.statusCode != 200) {
                    return cbko(401, body);
                } else if (response.request.uri.pathname == "/imp/login.php") {
                    return cbko(401, "Invalid user name or password");
                }
                
                var newid = response.request.uri.query.substr("Horde=".length);
                hordeid = newid.substring(0, newid.indexOf("&"));
                
                cbok(hordeid);
            }); 
        });
    }
    
    module.exports.login = function(req, res) {
        console.log("login for " + req.body.name);
        
        login(req.body.name, req.body.password, function(hordeid) {

            User.findOne({ name: req.body.name }, function(err, existingUser) {
                if (existingUser) {
                    existingUser.hordeid = hordeid;
                    existingUser.updated = Date.now();
                    existingUser.save(function(err, user) {
                        res.json({ token: createJWT(user), user: user });
                    });
                } else {
                    var user = new User({ 
                        name: req.body.name, 
                        password: req.body.password,
                        updated: Date.now(),
                        hordeid: hordeid
                    });
                    user.save(function(err, user) {
                        res.json({ token: createJWT(user), user: user });
                    });
                }
            });

        }, function(code, msg) {
            res.status(code).send(msg);
        });
        
    }
    
    module.exports.renew = function(req, res) {
        console.log("renew token for " + req.user);
        User.findById(req.user, "+password", function(err, user) {
            login(user.name, user.password, function(hordeid) {
                User.findByIdAndUpdate(user._id, { hordeid: hordeid, updated: Date.now() }, function(err, user) {
                    res.json({});  
                });
            }, function(code, msg) {
                res.status(code).send(msg);
            });
        });
    }
    
}());
