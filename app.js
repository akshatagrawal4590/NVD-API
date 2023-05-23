const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://0.0.0.0:27017/mdm");
