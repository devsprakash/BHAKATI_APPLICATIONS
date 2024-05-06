

const { body, validationResult, param, query } = require('express-validator');




exports.signup_validator = [

    body('temple_name')
        .not()
        .isEmpty()
        .withMessage('temple name is required')
        .isString().withMessage('temple name should be a string')
        .isLength({ min: 2, max: 25 })
        .trim(),

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email')
        .isLowercase().withMessage('email should be lowercase')
        .trim(),

    body('mobile_number')
        .not()
        .isEmpty()
        .withMessage('mobile_number is required')
        .isString().withMessage('mobile_number should be a string')
        .isMobilePhone().withMessage('please enter a valid mobile_number')
        .isLength({ min: 10, max: 12 }).withMessage('mobile_number length should be 10')
        .trim(),

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
        .isLength({ min: 8 }).withMessage('password length should be 10')
        .trim(),

    body('location')
        .not()
        .isEmpty()
        .withMessage('location is required')
        .isString().withMessage('location should be a string')
        .trim(),

    body('state')
        .not()
        .isEmpty()
        .withMessage('state is required')
        .isString().withMessage('state should be a string')
        .trim(),

    body('district')
        .not()
        .isEmpty()
        .withMessage('district is required')
        .isString().withMessage('district should be a string')
        .trim(),

    body('contact_person_name')
        .not()
        .isEmpty()
        .withMessage('contact_person_name is required')
        .isString().withMessage('contact_person_name should be a string')
        .trim(),

    body('contact_person_designation')
        .not()
        .isEmpty()
        .withMessage('contact_person_designation is required')
        .isString().withMessage('contact_person_designation should be a string')
        .trim(),
];


exports.temple_upload_image_validator = [

    param('templeId')
        .not()
        .isEmpty()
        .withMessage('templeId is required')
        .isString().withMessage('templeId should be a string')
        .isMongoId().withMessage('please enter a valid templeId')
        .trim(),
]

exports.delete_puja_validator = [

    query('id')
        .not()
        .isEmpty()
        .withMessage('puja_id is required')
        .isString().withMessage('puja_id should be a string')
        .isMongoId().withMessage('please enter a valid puja_id')
        .trim(),
]

exports.delete_puja_by_admin_validator = [

    param('puja_id')
        .not()
        .isEmpty()
        .withMessage('puj id is required')
        .isString().withMessage('puja id should be a string')
        .isMongoId().withMessage('please enter a valid puja id')
        .isLength({ min: 24 }).withMessage('puja id length must be 24')
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