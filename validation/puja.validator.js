
const { body, validationResult, param, query } = require('express-validator');




exports.add_puja_validator = [

    body('puja_name')
        .not()
        .isEmpty()
        .withMessage('puja_name is required')
        .isString().withMessage('puja_name should be a string')
        .trim(),

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim(),

    body('date')
        .not()
        .isEmpty()
        .withMessage('date is required')
        .isString().withMessage('date should be a string')
        .trim(),

    body('category')
        .not()
        .isEmpty()
        .withMessage('category is required')
        .isString().withMessage('category should be a string')
        .trim(),
];


exports.puja_add_by_temple_validator = [

    body('puja_name')
        .not()
        .isEmpty()
        .withMessage('puja_name is required')
        .isString().withMessage('puja_name should be a string')
        .trim(),

    body('duration')
        .not()
        .isEmpty()
        .withMessage('duration is required')
        .isNumeric().withMessage('duration should be a number')
        .trim(),

    body('price')
        .not()
        .isEmpty()
        .withMessage('price is required')
        .isNumeric().withMessage('price should be a number')
        .trim(),

    body('puja_id')
        .not()
        .isEmpty()
        .withMessage('puja_id is required')
        .isString().withMessage('puja_id should be a string')
        .isMongoId().withMessage('please enter a valid puja_id')
        .trim(),
]

exports.delete_puja_validator = [

    body('puja_id')
        .not()
        .isEmpty()
        .withMessage('puja_id is required')
        .isString().withMessage('puja_id should be a string')
        .isMongoId().withMessage('please enter a valid puja_id')
        .trim(),

]

exports.guru_suggested_video_validator = [

    query('guruId')
        .not()
        .isEmpty()
        .withMessage('guruId is required')
        .isString().withMessage('guruId should be a string')
        .isMongoId().withMessage('please enter a valid guruId')
        .isLength({ min: 24 }).withMessage('guruId length must be 24')
        .trim(),

]




exports.create_live_validator = [

    body('title')
        .not()
        .isEmpty()
        .withMessage('title is required')
        .isString().withMessage('title should be a string')
        .trim(),

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim()
]





exports.Validator_Result = (req, res, next) => {

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