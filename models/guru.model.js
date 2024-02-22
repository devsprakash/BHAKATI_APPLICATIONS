
const mongoose = require('mongoose');

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
    expertise: {
        type: String
    },
    status: {
        type: String
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temples'
    },
    verify: {
        type: Boolean,
        default: false
    }

});

// Define model for temple guru
const TempleGuru = mongoose.model('Guru', templeGuruSchema);

module.exports = TempleGuru;
