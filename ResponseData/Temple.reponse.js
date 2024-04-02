

exports.TempleReponse = (temple) => {

    const TempleResponse = {

        temple_name: temple.temple_name,
        temple_image: temple.temple_image,
        user_type: temple.user_type,
        id: temple._id,
        location: temple.location,
        state: temple.state,
        temple_id: temple.temples_id,
        district: temple.district,
        description: temple.description,
        mobile_number: temple.mobile_number,
        email: temple.email,
        background_image: temple.background_image,
        created_at: temple.created_at,
        updated_at: temple.updated_at,
        __v: 0
    }

    return TempleResponse;
}

exports.TempleLoginReponse = (temple) => {

    const TempleResponse = {

        temple_name: temple.temple_name,
        temple_image: temple.temple_image,
        background_image: temple.background_image,
        category: temple.category,
        user_type: temple.user_type,
        tokens: temple.tokens,
        refresh_tokens: temple.refresh_tokens,
        id: temple._id,
        temple_id: temple.temples_id,
        location: temple.location,
        state: temple.state,
        district: temple.district,
        description: temple.description,
        mobile_number: temple.mobile_number,
        email: temple.email,
        open_time: temple.open_time,
        closing_time: temple.closing_time,
        created_at: temple.created_at,
        updated_at: temple.updated_at,
        __v: 0
    }

    return TempleResponse;
}


exports.TempleLiveStreamingReponse = (temple) => {

    const TempleResponse = {

        temple_name: temple.temple_name,
        temple_image: temple.temple_image,
        background_image: temple.background_image,
        user_type: temple.user_type,
        id: temple._id,
        location: temple.location,
        temple_id: temple.temples_id,
        state: temple.state,
        district: temple.district,
        description: temple.description,
        title: temple.muxData.title,
        description: temple.muxData.description,
        plackback_id:temple.muxData.plackback_id,
        live_stream_id:temple.muxData.live_stream_id,
        created_at: temple.created_at,
        updated_at: temple.updated_at,
        __v: 0
    }

    return TempleResponse;
}