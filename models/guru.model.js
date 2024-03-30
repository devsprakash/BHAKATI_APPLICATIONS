
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
    muxData: {
        title: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        stream_key: {
            type: String,
            default: null
        },
        status: {
            type: String,
            default: null
        },
        reconnect_window: {
            type: String,
            default: null
        },
        max_continuous_duration: {
            type: String,
            default: null
        },
        latency_mode: {
            type: String,
            default: null
        },
        plackback_id: {
            type: String,
            default: null
        },
        live_stream_id: {
            type: String,
            default: null
        },
        created_at: {
            type: String,
            default: null
        },
    },
    temple_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guru',
        default: null
    },
    guru_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guru',
        default: null
    },
    temples_id:{
        type:String,
        default:null
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
