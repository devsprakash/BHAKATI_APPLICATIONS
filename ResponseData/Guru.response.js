
exports.guruResponseData = (guru) => {

    const response = {
        user_type: guru.user_type,
        background_image:guru.background_image,
        status: guru.status,
        guru_name: guru.guru_name,
        email: guru.email,
        mobile_number: guru.mobile_number,
        expertise: guru.expertise,
        guru_image_url: guru.guru_image,
        id: guru._id,
        guru_id:guru.gurus_id,
        created_at: guru.created_at,
        updated_at: guru.updated_at
    };

    return response;
};



exports.guruLoginResponse = (guru) => {

    const response = {
        user_type: guru.user_type,
        status: guru.status,
        guru_name: guru.guru_name,
        email: guru.email,
        mobile_number: guru.mobile_number,
        expertise: guru.expertise,
        guru_image_url: guru.guru_image,
        background_image:guru.background_image,
        tokens: guru.tokens,
        refresh_tokens: guru.refresh_tokens,
        id: guru._id,
        guru_id:guru.gurus_id,
        created_at: guru.created_at,
        updated_at: guru.updated_at
    };

    return response;
}

exports.guruLiveStreamResponse = (guru) => {

    const response = {
        id: guru._id,
        stream_key:guru.stream_key,
        description: guru.description,
        title: guru.title,
        description: guru.description,
        plackback_id: guru.plackback_id,
        live_stream_id: guru.live_stream_id,
        created_at: guru.created_at,
    };

    return response;

}