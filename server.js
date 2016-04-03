require('dotenv').config({silent: true});

var path = require('path');
var compression = require("compression");

var mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("etag", false);

require('./server/routes').register(app);

app.use(compression());
app.use(express.static(path.resolve(__dirname, 'client')));

require("./server/start-http").start(app);
