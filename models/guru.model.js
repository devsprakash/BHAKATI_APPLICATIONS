
const constants  = require('../config/constants');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const dateFormat = require('../helper/dateformat.helper');
const {
    JWT_SECRET
} = require('../keys/keys')


// Define schema for temple guru
const templeGuruSchema = new mongoose.Schema({

    GuruName: {
        type: String
    },
    GuruImg: {
        type: String
    },
    mobile_number: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    user_type:{
      type:String,
      default:constants.USER_TYPE.GURU
    },
    expertise: {
        type: String
    },
    status: {
        type: String,
        default:'active'
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temples'
    },
    verify: {
        type: Boolean,
        default: false
    },
    aadharacardNumber:{
        type:String
    },
    pancardNumber:{
       type:String
    },
    tokens: {
        type: String,
        default: null,
    },
    refresh_tokens: {
        type: String,
        default: null,
    },
    created_at:{
        type:String
    },
    updated_at:{
        type:String
    }

});


//Output data to JSON
templeGuruSchema.methods.toJSON = function () {
    const templeGuru = this;
    const templeGuruObject = templeGuru.toObject();
    return templeGuruObject;
};

//Checking for user credentials
templeGuruSchema.statics.findByCredentials = async function (email, password) {

    const templeGuru = await templeGuru.findOne({
        $or: [{ email: email }, { user_name: email }],
        deleted_at: null
    });

    if (!templeGuru) {
        return 1
    }

    if (!templeGuru.validPassword(password)) {
        return 2
    }

    return templeGuru;
}

//Generating auth token
templeGuruSchema.methods.generateAuthToken = async function () {
    const templeGuru = this;
    const token = await jwt.sign({
        _id: templeGuru._id.toString()
    }, JWT_SECRET, { expiresIn: '24h' })

    templeGuru.tokens = token
    templeGuru.updated_at = await dateFormat.set_current_timestamp();
    templeGuru.refresh_tokens_expires = await dateFormat.add_time_current_date(1, 'days')
    await templeGuru.save()
    return token
}

templeGuruSchema.methods.generateRefreshToken = async function () {
    const templeGuru = this;
    const refresh_tokens = await jwt.sign({
        _id: templeGuru._id.toString()
    }, JWT_SECRET)

    templeGuru.refresh_tokens = refresh_tokens
    templeGuru.updated_at = await dateFormat.set_current_timestamp();
    await templeGuru.save()
    return refresh_tokens
}



// Define model for temple guru
const TempleGuru = mongoose.model('Guru', templeGuruSchema);

module.exports = TempleGuru;
