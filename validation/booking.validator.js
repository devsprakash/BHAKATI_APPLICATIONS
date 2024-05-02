

const { body, validationResult, param, oneOf } = require('express-validator');



exports.create_new_slot_validator = [

    body('slot_duration')
        .not()
        .isEmpty()
        .withMessage('slot_duration is required')
        .isNumeric().withMessage('slot_duration should be a number')
        .isInt({ min: 1 }).withMessage('Slot duration should be a positive integer')
        .trim(),

    body('start_time')
        .not()
        .isEmpty()
        .withMessage('start_time is required')
        .isString().withMessage('start_time should be a string')
        .trim(),

    body('end_time')
        .not()
        .isEmpty()
        .withMessage('end_time is required')
        .isString().withMessage('end_time should be a string')
        .trim(),

    body('date')
        .not()
        .isEmpty()
        .withMessage('date is required')
        .isString().withMessage('date should be a string')
        .trim(),
];


exports.update_slot_validator = [

    param('slotId')
        .notEmpty().withMessage('slotId is required')
        .isString().withMessage('slotId should be a string')
        .isMongoId().withMessage('please enter a valid slot id')
        .isLength({ min: 24, max: 24 }).withMessage('slot id length must be 24 characters')
        .trim(),

    oneOf([
        body('slot_duration')
            .notEmpty().withMessage('slot_duration is required')
            .isNumeric().withMessage('slot_duration should be a number')
            .isInt({ min: 1 }).withMessage('Slot duration should be a positive integer')
            .trim(),

        body('start_time')
            .notEmpty().withMessage('start_time is required')
            .isString().withMessage('start_time should be a string')
            .trim(),

        body('end_time')
            .notEmpty().withMessage('end_time is required')
            .isString().withMessage('end_time should be a string')
            .trim(),

        body('date')
            .notEmpty().withMessage('date is required')
            .isString().withMessage('date should be a string')
            .trim()
    ],
        {
            message: 'Please provide a valid date or slot_duration or start_time or end_time',
        }),

];


exports.delete_slot_validator = [

    param('slotId')
        .notEmpty().withMessage('slotId is required')
        .isString().withMessage('slotId should be a string')
        .isMongoId().withMessage('please enter a valid slot id')
        .isLength({ min: 24, max: 24 }).withMessage('slot id length must be 24 characters')
        .trim(),
]



exports.download_booking_validator = [

    param('booking_id')
        .notEmpty().withMessage('booking_id is required')
        .isString().withMessage('booking_id should be a string')
        .isMongoId().withMessage('please enter a valid booking id')
        .isLength({ min: 24, max: 24 }).withMessage('booking id length must be 24 characters')
        .trim(),
]

exports.new_booking_validator = [

    body('start_time')
        .not()
        .isEmpty()
        .withMessage('start_time is required')
        .isString().withMessage('start_time should be a string')
        .trim(),

    body('end_time')
        .not()
        .isEmpty()
        .withMessage('end_time is required')
        .isString().withMessage('end_time should be a string')
        .trim(),

    body('date')
        .not()
        .isEmpty()
        .withMessage('date is required')
        .isString().withMessage('date should be a string')
        .trim(),

    body('temple_id')
        .not()
        .isEmpty()
        .withMessage('temple_id is required')
        .isString().withMessage('temple_id should be a string')
        .isMongoId().withMessage('please enter a valid temple id')
        .isLength({ min: 24, max: 24 }).withMessage('temple_id length must be 24 characters')
        .trim(),

    body('name')
        .not()
        .isEmpty()
        .withMessage('name is required')
        .isString().withMessage('name should be a string')
        .trim(),

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email')
        .trim(),

    body('mobile_number')
        .not()
        .isEmpty()
        .withMessage('mobile_number is required')
        .isString().withMessage('mobile_number should be a string')
        .isMobilePhone().withMessage('please enter a valid mobile_number')
        .trim(),

    body('puja_id')
        .not()
        .isEmpty()
        .withMessage('puja_id is required')
        .isString().withMessage('puja_id should be a string')
        .isMongoId().withMessage('please enter a valid puja id')
        .isLength({ min: 24, max: 24 }).withMessage('puja id length must be 24 characters')
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