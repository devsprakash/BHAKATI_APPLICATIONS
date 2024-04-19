

exports.LoginResponse = (user) => {

    const LoginData = {
        status: user.status,
        signup_status: user.signup_status,
        otp: user.otp,
        _id: user._id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
    }
    return LoginData;
}

exports.LoginResponseData = (user) => {

    const loginResponse = {

        user_type: user.user_type,
        verify: user.verify,
        status: user.status,
        signup_status: user.signup_status,
        tokens: user.tokens,
        refresh_tokens: user.refresh_tokens,
        otp: user.otp,
        deleted_at: user.deleted_at,
        _id: user._id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
    }

    return loginResponse;
}

exports.VerifyOtpResponse = (user) => {

    const VerifyOtpResponse = {

        user_type: user.user_type,
        verify: user.verify,
        status: user.status,
        signup_status: user.signup_status,
        tokens: user.tokens,
        refresh_tokens: user.refresh_tokens,
        deleted_at: user.deleted_at,
        _id: user._id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
    }

    return VerifyOtpResponse;
}


exports.userResponse = (user) => {

    const users = {
        full_name: user.full_name,
        mobile_number: user.mobile_number,
        dob: user.dob,
        gender: user.gender,
        user_type: user.user_type,
        status: user.status,
        isUpdated: user.isUpdated,
        verify: user.verify,
        signup_status: user.signup_status,
        deleted_at: user.deleted_at,
        _id: user._id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
    }

    return users
}



exports.userProfileImageResponse = (user) => {

    const users = {
        full_name: user.full_name,
        mobile_number: user.mobile_number,
        dob: user.dob,
        gender: user.gender,
        user_type: user.user_type,
        status: user.status,
        isUpdated: user.isUpdated,
        verify: user.verify,
        profile_image_url:user.profileImg,
        signup_status: user.signup_status,
        deleted_at: user.deleted_at,
        _id: user._id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
    }

    return users
}
