(function(){
    var cheerio = require('cheerio');
    var qs      = require('querystring');
    var shortid = require("shortid");
  
    function getRequest(horde) {
        var request = require("request");
        
        var j = request.jar();
        j.setCookie(request.cookie('auth_key=' + horde), process.env.HORDE_URL);
        j.setCookie(request.cookie('imp_key=' + horde), process.env.HORDE_URL);
        
        var headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Upgrade-Insecure-Requests": 1,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.57 Safari/537.36",
            "Accept-Language": "fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4"
        };
    
        return request.defaults({ jar: j, headers: headers });
    }
    
    function parseLink(href) {
        var link = href.substr(href.indexOf("?") + 1);
        return qs.parse(link);
    }
    
    module.exports.getallmails = function(req, res) {
        var page = req.params.page || 1;

        var url = process.env.HORDE_URL + "/imp/mailbox.php?mailbox=INBOX&Horde=" + req.user.hordeid + "&page=" + page;
        var request = getRequest(req.user.hordeid);
        request.get({url: url, followRedirect: false}, function(error, response, body){
            if (response.statusCode == 302) {
                return res.status(401).send("login expired");
            }
            
            var mails = [];
            
            $ = cheerio.load(body);
            
            var current = $("#page1").val();
            var last = $("link[rel='Last']").attr("href");
            var pagination = {
                current: +current,
                last: +last
            };
            
            $(".messageList tr").next().each(function(i, elt){
                if (!$(this).hasClass("deleted")) {
                    var unread = $(this).hasClass("unseen");
                    var id = $(this).find("td:nth-child(4) a").attr("href");
                    id = id.substr(id.indexOf("?") + 1);
                    var q = qs.parse(id);
                    id = q.index;
                    
                    var date = $(this).find("td:nth-child(3) div").text().trim();
                    var from = $(this).find("td:nth-child(4) a").text(); 
                    var title = $(this).find("td:nth-child(5) a").text(); 
                    
                    mails.push({
                        id: id,
                        date: date,
                        from: from,
                        title: title,
                        unread: unread 
                    });
                }
            });
  
            res.json({
                pages: pagination,
                mails: mails
            });
        });
    };
    
    module.exports.debug = function(req, res) {
        var url = process.env.HORDE_URL + "/imp/mailbox.php?mailbox=INBOX&Horde=" + req.user.hordeid;
        var request = getRequest(req.user.hordeid);
        request.get({url: url, followRedirect: false}, function(error, response, body){
            if (response.statusCode == 302) {
                return res.status(401).send("login expired");
            }
            
            res.send(body);
        });
    };
    
    module.exports.asset = function(req, res) {
        console.log("asset");

        var url = process.env.HORDE_URL + "/imp/view.php?Horde=" + req.query.hordeid;
        url += "&mailbox=INBOX&index=" + req.query.mail + "&actionID=view_attach";
        url += "&id=" + req.query.id;

        var request = getRequest(req.query.hordeid);
        request.get(url).pipe(res);
    }
    
    module.exports.attachment = function(req, res) {
        console.log("attachment");

        var url = process.env.HORDE_URL + "/services/download/?module=imp&actionID=download_attach&Horde=" + req.query.hordeid;
        url += "&thismailbox=INBOX&mailbox=INBOX&index=" + req.query.mail + "&actionID=view_attach";
        url += "&id=" + req.query.id + "&mimecache=" + req.query.mimecache + "&fn=" + encodeURIComponent(req.query.fn);

        var request = getRequest(req.query.hordeid);
        request.get(url).pipe(res);
    }
    
    module.exports.getmail = function(req, res) {
        var url = process.env.HORDE_URL + "/imp/message.php?Horde=" + req.user.hordeid + "&mailbox=INBOX&index=" + req.params.id;
        
        var request = getRequest(req.user.hordeid);
        request.get({url: url, followRedirect: false}, function(error, response, body){
            if (response.statusCode == 302) {
                return res.status(401).send("login expired");
            }
            
            $ = cheerio.load(body);
            
            var headers = $("#msgheaders");
            var when = headers.find("tr:nth-child(1) td:nth-child(2)").text();
            var from = headers.find("tr:nth-child(2) td:nth-child(2) a").text();
            var to = headers.find("tr:nth-child(3) td:nth-child(2)").text();
            var subject = headers.find("tr:nth-child(4) td:nth-child(2)").text();
            var attachments = headers.find("tr:nth-child(5) td.msgheader tr");
            var attach = [];
            if (attachments.length > 0) {
                attachments.each(function(){
                    var title = $(this).find("td:nth-child(3)").text();
                    var link = $(this).find("td:nth-child(4) a").attr("href");
                    var q = parseLink(link);
                    
                    var url = "/api/mail/attach?hordeid=" + req.user.hordeid;
                    url += "&mail=" + req.params.id;
                    url += "&id=" + q.id;
                    url += "&mimecache=" + q.mimecache;
                    url += "&fn=" + q.fn;
                    
                    attach.push({
                        title: title,
                        url: url
                    }); 
                });
            }
            
            // token for deletion
            var msgtoken = "";
            var del = $(".msgactions a[href*='delete_message']").first();
            var link = del.attr("href");
            var q = parseLink(link);
            msgtoken = q.message_token;
            
            // fix images
            $("#html-message [blocked]").each(function(i, elt) {
                var src = qs.unescape($(this).attr("blocked"));
                if (src.startsWith("/imp/")) {
                    q = parseLink(src);

                    src = "/api/mail/asset?mail=" + q.index + "&id=" + q.id + "&hordeid=" + q.Horde;
                }
                if ($(this).attr("src")) {
                    $(this).attr("src", src);
                } else if ($(this).attr("background")) {
                    $(this).attr("background", src);
                } else if ($(this).css("backgroundImage")) {
                    $(this).css("backgroundImage", "url(" + src + ")");
                }
            });
            
            // display html content, or body if not html
            var content = $("#html-message").html();
            if (!content) {
                content = $("#messageBody").html();
            }
            
            res.json({
                id: req.params.id,
                when: when,
                from: from,
                to: to,
                subject: subject,
                msgtoken: msgtoken,
                content: content,
                attach: attach
            });
        });
    };
    
    module.exports.delete = function(req, res) {
        var url = process.env.HORDE_URL + "/imp/message.php?Horde=" + req.user.hordeid + "&mailbox=INBOX&index=" + req.params.id + "&start=1&message_token=" + req.query.token + "&actionID=delete_message";
        var request = getRequest(req.user.hordeid);
        request.get({url: url, followRedirect: false}, function(error, response, body){
            if (response.statusCode == 302) {
                return res.status(401).send("login expired");
            }
            
            res.json({});
        });
    }
    
    module.exports.create = function(req, res) {
        console.log("new mail");
        var uniq = new Date().getTime();
        var url = process.env.HORDE_URL + "/imp/compose.php?Horde=" + req.user.hordeid + "&uniq=" + uniq + "&mailbox=INBOX";
        
        var request = getRequest(req.user.hordeid);
        request.get({url: url, followRedirect: false}, function(error, response, body){
            if (response.statusCode == 302) {
                return res.status(401).send("login expired");
            }
            
            $ = cheerio.load(body);
            var form = {};
            $("#compose input").each(function(){
                form[$(this).attr("name")] = $(this).val() || "";
            });
            form["actionID"] = "send_message";
            form["save_sent_mail"] = "on";
            form["sent_mail_folder"] = "Sent";
            form["save_attachments_select"] = 0;
            form["charset"] = "UTF-8";
            
            form["to"] = req.body.contacts.join(";");
            form["subject"] = req.body.subject;
            form["message"] = req.body.message;

            request = getRequest(req.user.hordeid);
            request.post({url: url, formData: form, followRedirect: false}, function(error, response, body){
                if (response.statusCode == 302) {
                    return res.status(401).send("login expired");
                }
                
                res.json({});
            });
        });

    }

    module.exports.replyinfo = function(req, res) {
        console.log("reply info for " + req.params.id);
        var uniq = new Date().getTime();
        var url = process.env.HORDE_URL + "/imp/compose.php?Horde=" + req.user.hordeid + "&uniq=" + uniq + "&thismailbox=INBOX&identity=0&actionID=reply_all&index=" + req.params.id;

        var request = getRequest(req.user.hordeid);
        request.get({url: url, followRedirect: false}, function(error, response, body){
            if (response.statusCode == 302) {
                return res.status(401).send("login expired");
            }
            
            $ = cheerio.load(body);
            var original = $("#message").val();
            var to = $("#to").val();
            
            var mail = {
                id: req.params.id,
                subject: $("#subject").val(),
                to: $("#to").val(),
                cc: $("#cc").val(),
                content: $("#message").val()
            }
            
            res.json(mail);
        });
    }
   
    module.exports.reply = function(req, res) {
        console.log("reply to " + req.params.id);
        var uniq = new Date().getTime();
        var url = process.env.HORDE_URL + "/imp/compose.php?Horde=" + req.user.hordeid + "&uniq=" + uniq + "&thismailbox=INBOX&identity=0&actionID=reply_all&index=" + req.params.id;
        
        var request = getRequest(req.user.hordeid);
        request.get({url: url, followRedirect: false}, function(error, response, body){
            if (response.statusCode == 302) {
                return res.status(401).send("login expired");
            }
            
            $ = cheerio.load(body);

            var form = {};
            $("#compose input").each(function(){
                form[$(this).attr("name")] = $(this).val() || "";
            });
            form["actionID"] = "send_message";
            form["save_sent_mail"] = "on";
            form["sent_mail_folder"] = "Sent";
            form["save_attachments_select"] = 0;
            form["charset"] = "UTF-8";
            
            form["to"] = req.body.to.join(";");
            if (req.body.cc) form["cc"] = req.body.cc.join(";");
            form["subject"] = req.body.subject;
            form["message"] = req.body.message;

            request = getRequest(req.user.hordeid);
            request.post({url: url, formData: form, followRedirect: false}, function(error, response, body){
                if (response.statusCode == 302) {
                    return res.status(401).send("login expired");
                }
                
                res.json({});
            });
        });

    }
}());
