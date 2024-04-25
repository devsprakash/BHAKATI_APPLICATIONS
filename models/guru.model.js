
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const dateFormat = require('../helper/dateformat.helper');
const {
    JWT_SECRET
} = require('../keys/keys')




// Define schema for temple guru
const templeGuruSchema = new mongoose.Schema({

    guru_name: {
        type: String,
        default: null
    },
    guru_image: {
        type: String,
        default: null
    },
    mobile_number: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    user_type: {
        type: Number,
    },
    expertise: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 'active'
    },
    verify: {
        type: Boolean,
        default: false
    },
    tokens: {
        type: String,
        default: null,
    },
    refresh_tokens: {
        type: String,
        default: null,
    },
    start_time: {
        type: String,
        default: null
    },
    end_time: {
        type: String,
        default: null
    },
    temples_id: {
        type: String,
        default: null
    },
    gurus_id: {
        type: String,
        default: null
    },
    temple_name: {
        type: String,
        default: null
    },
    temple_image: {
        type: String,
        default: null
    },
    background_image: {
        type: String
    },
    location: {
        type: String,
        default: null
    },
    district: {
        type: String,
        default: null
    },
    state: {
        type: String
    },
    description: {
        type: String,
        default: null
    },
    open_time: {
        type: String,
        default: null
    },
    trust_name: {
        type: String,
    },
    closing_time: {
        type: String,
        default: null
    },
    category: {
        type: String,
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    },
    deleted_at: {
        type: String,
        default: null
    }

});




templeGuruSchema.methods.toJSON = function () {
    const templeGuru = this.toObject();
    return templeGuru;
};


templeGuruSchema.statics.findByCredentials = async function (email, password) {
    const templeGuru = await this.findOne({
        email: email,
        password: password,
        deleted_at: null
    });

    if (!templeGuru) {
        return null;
    }

    return templeGuru;
};


templeGuruSchema.methods.generateAuthToken = async function () {
    const templeGuru = this;
    const token = jwt.sign({ _id: templeGuru._id.toString() }, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 2 });
    templeGuru.tokens = token;
    templeGuru.updated_at = await dateFormat.set_current_timestamp();
    await templeGuru.save();
    return token;
};


templeGuruSchema.methods.generateRefreshToken = async function () {
    const templeGuru = this;
    const refreshToken = jwt.sign({ _id: templeGuru._id.toString() }, JWT_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
    templeGuru.refresh_tokens = refreshToken;
    templeGuru.updated_at = await dateFormat.set_current_timestamp();
    await templeGuru.save();
    return refreshToken;
};


const TempleGuru = mongoose.model('Guru', templeGuruSchema);
module.exports = TempleGuru;