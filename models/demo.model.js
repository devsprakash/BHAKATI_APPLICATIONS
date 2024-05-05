

const mongoose = require('mongoose');


const demoSchema = new mongoose.Schema({
     name:String,
     age:Number
})


const demo =  mongoose.model("data" , demoSchema);
module.exports = demo;