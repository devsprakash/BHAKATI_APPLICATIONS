
const mongoose = require('mongoose');



const BankSchema = new mongoose.Schema({

    account_number: {
        type: Number,
    },
    ifsc_code: {
        type: String
    },
    bank_name: {
        type: String
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guru'
    },
    created_at: {
        type: String
    },
    updated_at:{
        type:String
    }
})

const Bank = mongoose.model('bank' , BankSchema);
module.exports = Bank;