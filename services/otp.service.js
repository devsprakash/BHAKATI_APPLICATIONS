
const axios = require('axios');
const { MSG91AUTHKEY } = require('../keys/development.keys')





exports.sendOTP = async (mobileNumber) => {

    try {

        const url = `https://control.msg91.com/api/v5/otp?template_id=661ddf18d6fc0557e03feb72&mobile=91${mobileNumber}`;

        const headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authkey": `${MSG91AUTHKEY}`
        };

        const response = await axios.get(url, { headers });

        console.log('OTP Sent Successfully:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error sending OTP:', error.response.data);
        throw error;
    }
}


exports.verifyOTP = async (mobileNumber, otp) => {

    try {
        
    } catch (error) {
        console.error('Error verifying OTP:', error.response.data);
        throw error;
    }
}


exports.resendOTP = async (mobileNumber) => {

    try {

        const msg91Endpoint = 'https://control.msg91.com/api/v5/otp/retry';

        const requestData = {
            authkey: MSG91AUTHKEY,
            retrytype: 'text',
            mobile: mobileNumber
        };

        const response = await axios.post(msg91Endpoint, requestData);

        console.log('OTP resend successful:', response.data);

        return response.data;

    } catch (error) {
        console.error('Error resending OTP:', error.response.data);
        throw new Error('Failed to resend OTP');
    }
}