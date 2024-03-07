
exports.guruResponseData = (guru) => {

    const response = {
        user_type: guru.user_type,
        status: guru.status,
        GuruName: guru.GuruName,
        email: guru.email,
        mobile_number: guru.mobile_number,
        expertise: guru.expertise,
        templeId: guru.templeId,
        GuruImg: guru.GuruImg,
        _id: guru._id,
        created_at: guru.created_at,
        updated_at: guru.updated_at
    };

    return response;
};

exports.guruLoginResponse = (guru) => {

    const response = {
        user_type: guru.user_type,
        status: guru.status,
        GuruName: guru.GuruName,
        email: guru.email,
        mobile_number: guru.mobile_number,
        expertise: guru.expertise,
        templeId: guru.templeId,
        GuruImg: guru.GuruImg,
        tokens: guru.tokens,
        refresh_tokens: guru.refresh_tokens,
        _id: guru._id,
        created_at: guru.created_at,
        updated_at: guru.updated_at
    };

    return response;
}

exports.guruLiveStreamResponse = (guru) => {

    const response = {

        user_type: guru.user_type,
        status: guru.status,
        GuruName: guru.GuruName,
        email: guru.email,
        mobile_number: guru.mobile_number,
        expertise: guru.expertise,
        templeId: guru.templeId,
        GuruImg: guru.GuruImg,
        _id: guru._id,
        plackBackId: guru.muxData.plackBackId,
        stream_key: guru.muxData.stream_key,
        status: guru.muxData.status,
        reconnect_window: guru.muxData.reconnect_window,
        LiveStreamId: guru.muxData.LiveStreamId,
        updated_at: guru.updated_at,
        created_at: guru.created_at
    };

    return response;

}