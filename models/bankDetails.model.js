
const mongoose = require('mongoose');



const BankSchema = new mongoose.Schema({

    bank_logo: {
        type: String
    },
    bank_name: {
        type: String
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})

const Bank = mongoose.model('bank', BankSchema);
module.exports = Bank;