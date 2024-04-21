const nodemailer = require('nodemailer');
const { EMAIL_FORM, PASSWORD_FORM, EMAIL_SERVICE } = require('../keys/development.keys');

exports.sendMail = async (email, text) => {
  try {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_FORM,
        pass: PASSWORD_FORM,
      },
    });

    const mailOptions = {
      from: {
        name: 'BHAKATI CHANNELS',
        address: EMAIL_FORM,
      },
      to: email,
      subject: 'OTP VERIFICATION',
      text: text,
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
