
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const constants = require('../config/constants');
const dateFormat = require('../helper/dateformat.helper');
const {
    JWT_SECRET
} = require('../keys/keys')
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
    email: {
        type: String
    },
    password: {
        type: String
    },
    tempTokens: {
        type: String
    },
    tokens: {
        type: String,
        default: null,
    },
    refresh_tokens: {
        type: String,
        default: null,
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
    Temple_Open_time: {
        type: String
    },
    Closing_time: {
        type: String
    },
    user_type: {
        type: Number,
        default: constants.USER_TYPE.GURU
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

//Checking for user credentials
templeSchema.statics.findByCredentials = async function (email, password) {

    const temple = await Temple.findOne({
        $or: [{ email: email }, { user_name: email }],
        deleted_at: null
    });

    if (!temple) {
        return 1
    }

    if (!temple.validPassword(password)) {
        return 2
    }

    return temple;
}

//Generating auth token
templeSchema.methods.generateAuthToken = async function () {
    const temple = this;
    const token = await jwt.sign({
        _id: temple._id.toString()
    }, JWT_SECRET, { expiresIn: '24h' })

    temple.tokens = token
    temple.updated_at = await dateFormat.set_current_timestamp();
    temple.refresh_tokens_expires = await dateFormat.add_time_current_date(1, 'days')
    await temple.save()
    return token
}

templeSchema.methods.generateRefreshToken = async function () {
    const temple = this;
    const refresh_tokens = await jwt.sign({
        _id: temple._id.toString()
    }, JWT_SECRET)

    temple.refresh_tokens = refresh_tokens
    temple.updated_at = await dateFormat.set_current_timestamp();
    await temple.save()
    return refresh_tokens
}



const Temple = mongoose.model('temples', templeSchema);
module.exports = Temple;