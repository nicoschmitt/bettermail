(function(){
    
    var mongoose = require('mongoose');
    var shortid = require("shortid");

    var userSchema = new mongoose.Schema({ 
        _id: {
            type: String,
            unique: true,
            'default': shortid.generate
        },
        name: String,
        password: { type: String, select: false },
        hordeid: String
    })
        
    var User = mongoose.model("User", userSchema);
    module.exports = User;
    
}());
