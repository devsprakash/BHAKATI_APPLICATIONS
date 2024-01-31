const {
  ObjectId
} = require('mongoose').Types;


const constants = require('../../config/constants');
const User = require("../../models/user.model")

exports.getUser = async (idOrEmail, fieldName = '_id') => {
  const data = await User.findOne({
    [fieldName]: `${idOrEmail}`
  }).lean();
  return data;
};

exports.deleteUserAccount = async (userId , updateData) => {

   try {
    
    const user = await User.findOneAndDelete({_id:userId })
    return user;
     
   }catch(err) {
      throw new Error(err.message)
   }
}


exports.Usersave = data => new User(data).save();

exports.checkAdmin = async (userId) => {

  try {

   const users =  await User.findOne({_id: userId })

   if( users.user_type !== constants.USER_TYPE.ADMIN){

       throw new Error('You are not allowed to access this Api')
   }
   
   return users;

  }catch(err) {

     throw err;
  }
}
