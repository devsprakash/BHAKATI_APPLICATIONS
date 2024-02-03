
const { body, validationResult , param } = require('express-validator');

const validGender = ['male', 'female', 'other']


exports.user_validator = [

  body('full_name')
    .not()
    .isEmpty()
    .withMessage('full_name is required')
    .isString().withMessage('full_name should be a string')
    .trim(),

  body('dob')
    .not()
    .isEmpty()
    .withMessage('dob is required')
    .isString().withMessage('dob should be a string')
    .trim(),

  body('gender')
    .not()
    .isEmpty()
    .withMessage('gender is required')
    .isString().withMessage('gender should be a string')
    .matches(validGender)
    .withMessage('please enter a valid gender')
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
    .isString()
    .withMessage('password should be a string')
    .trim()
    .isLength({ min: 8 }).withMessage('password should be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{8,}$/)
    .withMessage('please enter a valid password like this : demo122@'),

  body('mobile_number')
    .not()
    .isEmpty()
    .withMessage('mobile_number is required')
    .isString().withMessage('mobile_number should be a string')
    .isMobilePhone().withMessage('please enter a valid mobile_number address')
    .trim(),

];


exports.login_validator = [

  body('email')
    .not()
    .isEmpty()
    .withMessage('email is required')
    .isString().withMessage('email should be a string')
    .isEmail().withMessage('please enter a valid email address')
    .trim(),

]

exports.update_profile_validator = [

      param('userId')
      .not()
      .isEmpty()
      .withMessage('userId is required')
      .isString().withMessage('userId should be a string')
      .isMongoId().withMessage('please enter a valid userId')

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