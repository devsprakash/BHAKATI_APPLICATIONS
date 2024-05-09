


const { body, validationResult, param, query, oneOf } = require('express-validator');


exports.add_new_video_validator = [

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim(),

    body('title')
        .not()
        .isEmpty()
        .withMessage('title is required')
        .isString().withMessage('title should be a string')
        .trim()
];


exports.update_rithual_validator = [

    param('rithualId')
    .not()
    .isEmpty()
    .withMessage('rithualId is required')
    .isString().withMessage('rithualId should be a string')
    .isMongoId().withMessage('please enter a valid rithualId')
    .trim(),

oneOf([

    body('ritual_name')
    .not()
    .isEmpty()
    .withMessage('ritual_name is required')
    .isString().withMessage('ritual_name should be a string')
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
],
    {
        message: 'please enter valid key',
    }),
]

exports.delete_rithual_validator = [

    param('rithualId')
    .not()
    .isEmpty()
    .withMessage('rithualId is required')
    .isString().withMessage('rithualId should be a string')
    .isMongoId().withMessage('please enter a valid rithualId')
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