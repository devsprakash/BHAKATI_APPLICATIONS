
const { body, validationResult, param } = require('express-validator');


exports.add_guru_validator = [

    body('guru_name')
        .not()
        .isEmpty()
        .withMessage('guru_name is required')
        .isString().withMessage('guru_name should be a string')
        .trim(),

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email address')
        .trim(),

    body('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isString().withMessage('password should be a string')
        .isLength({ min: 8 }).withMessage('password length should be 8 characters')
        .trim(),

    body('mobile_number')
        .not()
        .isEmpty()
        .withMessage('mobile_number is required')
        .isString().withMessage('mobile_number should be a string')
        .isMobilePhone().withMessage('please enter a valid mobile_number')
        .isLength({ min: 10, max: 12 }).withMessage('mobile_number length must be 10 digit')
        .trim(),

    body('expertise')
        .not()
        .isEmpty()
        .withMessage('expertise is required')
        .isString().withMessage('expertise should be a string')
        .trim(),

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim()

];


exports.login_validator = [

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email address')
        .trim(),

    body('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isString().withMessage('password should be a string')
        .isLength({ max: 8 }).withMessage('password length should be 8 characters')
        .trim(),

]

exports.verifyOtp_validator = [

    param('userId')
        .not()
        .isEmpty()
        .withMessage('userId is required')
        .isString().withMessage('userId should be a string')
        .isMongoId().withMessage('please enter a valid userId')
        .trim(),

    body('otp')
        .not()
        .isEmpty()
        .withMessage('otp is requires')
        .isLength({ min: 1, max: 6 })
        .withMessage('otp length must be at least 6 digits')
        .trim()

]

exports.admin_login_validator = [


    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email address')
        .trim(),

    body('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isString()
        .withMessage('password should be a string')
        .trim()
        .isLength({ min: 8 }).withMessage('password should be at least 8 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{8,}$/)
        .withMessage('please enter a valid password like this : demo122@'),

]


exports.Guru_Validator_Result = (req, res, next) => {

    try {

        const result = validationResult(req);
        const haserror = !result.isEmpty();

        if (haserror) {
            const err = result.array()[0].msg;
            return res.status(400).send({ sucess: false, message: err });
        }
        next();

    } catch (err) {

        res.status(false).send({ status: false, message: err.message })
    }
}