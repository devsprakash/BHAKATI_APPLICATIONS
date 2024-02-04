
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Define user schema
const templeSchema = new Schema({

    TempleName: {
        type: String,
        default: null
    },
    TempleImg: {
        type: String,
        default: null
    },
    Location: {
        type: String
    },
    State: {
        type: String
    },
    District: {
        type: String
    },
    trust_mobile_number: {
        type: String
    },
    templeId: {
        type: String
    },
    Desc: {
        type: String
    },
    status:{
        type:String,
        default:null
    },
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    },
    deleted_at: {
        type: String,
        default: null,
    },
});


//Output data to JSON
templeSchema.methods.toJSON = function () {
    const temple = this;
    const templeObject = temple.toObject();
    return templeObject;
};



const Temple = mongoose.model('temples', templeSchema);
module.exports = Temple;