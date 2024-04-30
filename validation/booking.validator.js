

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