
const { body, validationResult, query } = require('express-validator');


exports.login_validator = [

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email')
        .trim(),

    body('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isString().withMessage('password should be a string')
        .isLength({ min: 8 }).withMessage('password length must be 8 characters')
        .trim(),
]

exports.delete_user_account_validator = [

    query('userId')
        .not()
        .isEmpty()
        .withMessage('userId is required')
        .isString().withMessage('userId should be a string')
        .isMongoId().withMessage('please enter a valid userId')
        .trim(),
]



exports.ValidatorResult = (req, res, next) => {

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