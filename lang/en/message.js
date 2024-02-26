module.exports = {

    'USER': {
        signUp_success: 'User signUp successfully.',
        login_success: 'Login successfully.',
        social_login_success: 'Social login successfully.',
        logout_success: 'Logout successfully.',
        logout_fail: 'Error while logging you out.',
        resetPassword_success: 'Your password has been updated successfully.',
        forgotPassword_success: 'Your password has been updated successfully.',
        userDetail_not_available: 'User details not available at this time.',
        invalidOldPassword: 'Please enter a valid old password.',
        passwordMinLength: 'Your password must contain at least 6 characters.',
        passwordUpdate_success: 'Your password successfully changed.',
        profile_fetch_success: 'Profile fetch successfull.',
        profile_update_success: 'Profile updated successfully.',
        email_not_found: 'Username/Email is not registered.',
        forgotPassword_email_success: 'Please check your email to reset password.',
        resend_email_success: 'Resend mail send successfully.',
        forgotPassword_email_fail: 'Error while sending link.',
        resetPassword_token_success: 'Token varified.',
        resetPassword_token_fail: 'Token expired.',
        password_update_fail: 'Error while updating password.',
        set_new_password_fail: 'Your link has been expired.',
        set_new_password_success: 'Your password has been reset successfully.',
        user_name_already_exist: 'This username has already been taken. Please enter a different username.',
        email_already_exist: 'Email already in use.',
        delete_account: 'Your account is deleted.',
        not_verify_account: 'Please verify your account.',
        deactive_account: 'Your account is deactivated by administrator.',
        inactive_account: 'Your account is deactivated by administrator.',
        account_verify_success: `Your account has been verified successfully. Please click 'Continue' in the app to proceed.`,
        account_verify_fail: 'Your account verify link expire or invalid.',
        password_mismatch: 'New password and confirm password not matched.',
        invalid_username_password: "Invalid email or password.",
        invalid_password: "Invalid password.",
        user_data_retrieved_success : 'User data retrieved successfully.',
        user_activation : 'User activated successfully.',
        user_inactivation : 'User inactivated successfully.',
        user_deactivate : 'User deactivated successfully.',
        user_details_not_available : 'User details not available.',
        get_user_profile : 'User profile get profile.',
        user_deleted: 'User deleted successfully.',
        get_user_notificatuon_setting : 'User notification setting details.',
        update_user_notificatuon_setting : 'User notification setting details update successfully.',
        not_found: 'User not found, Please sign up.',
        get_user_skill_message: "get user skill message successfully.",
        logout_success: "Logout successfully.",
        account_already_verify: "Account alredy verify",
        fbid_required: 'facebook ID is required.',
        get_user_auth_token: 'get new auth tokens',
        existingEmail:'this email is alreday existing',
        no_image_upload:'no such image uploaded to the server',
        opt_verify:'Your otp is verified successfully',
        otp_not_matched:'Your otp does not match',
        delete_account:'successfully delete this account',
        already_updated:'Your account already updated',
        not_verify:'Your not verified Please verify your account',
        update_device_token : 'successfully updated device token'

    },

    'GENERAL': {
        
        general_error_content: 'Something went wrong. Please try again later.',
        unauthorized_user: 'Unauthorized, please login.',
        invalid_user: 'You are not authorized to do this operation.',
        invalid_login: 'You are not authorized.',
        blackList_mail: `Please enter a valid email, we don't allow dummy emails.`
    },
    'BOOKING':{
        new_slot_booking:'slot booking successfully',
        not_found:'all the booking slot data is not found',
        get_all_booking:'successfully get all booking slots',
        get_all_temples:'successfully get all booking temples',
        booking_downlod:'successfully downloading this booking slot'
    },
    'TEMPLE':{
        addTemple:'successfully add a new temple',
        not_found:'temples are not found',
        get_all_temples:'successfully get all temples',
        delete_temples:'successfully delete this temple',
        already_delete_temples:'this temple is already deleted',
        temple_login : 'temple login sucessfully',
        email_already_exist:'email already exists',
        logout_success:'temple logout succesfully'
   },

   'LIVESTREAM':{
     
       create_new_live_stream_video: 'successfully created a new live streaming video',
       get_all_live_streams_by_puja: 'successfully get all live streams by puja',
       get_all_live_streams_by_rithuals: 'successfully get all live streams by rithuals',
       delete_live_streams: 'successfully delete live streaming'
   },
   'PUJA':{
      add_new_puja : 'successfully added a new puja',
      not_found: 'currently no puja found',
      get_all_puja : 'successfully get all puja',
      update_puja : 'successfully update puja',
      add_new_rithuals: 'successfully add new rithuals',
      Invalid_page: 'Invalid page or limit values.',
      get_all_rithuals:'successfully get all rithuals'
   },
   'GURU':{
      add_new_guru: 'successfully add new guru',
      existing_email: 'this email is already existing',
      guru_login_success:'guru login successfully',
      guru_not_found: 'guru was not found',
      guru_logout:'guru logout successfully',
      get_all_gurus:'successfully get all the gurus information',
      get_guru_profile: 'successfully get the guru profile',
      guru_live_stream_created: 'guru successfully create a new live stream',
      get_all_LiveStream : 'successfully get all the Live Stream',
      get_Live_Stream_By_Guru:'successfully get all the Live stream'
   }
}