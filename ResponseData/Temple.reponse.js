

exports.TempleReponse = (temple) => {

    const TempleResponse = {

        TempleName: temple.TempleName,
        TempleImg: temple.TempleImg,
        user_type: temple.user_type,
        _id: temple._id,
        Location: temple.Location,
        State: temple.State,
        District: temple.District,
        Desc: temple.Desc,
        mobile_number: temple.mobile_number,
        email: temple.email,
        templeId: temple.templeId,
        created_at: temple.created_at,
        updated_at: temple.updated_at,
        __v: 0
    }

    return TempleResponse;
}

exports.TempleLoginReponse = (temple) => {

    const TempleResponse = {

        TempleName: temple.TempleName,
        TempleImg: temple.TempleImg,
        user_type: temple.user_type,
        tokens:temple.tokens,
        refresh_tokens: temple.refresh_tokens,
        _id: temple._id,
        Location: temple.Location,
        State: temple.State,
        District: temple.District,
        Desc: temple.Desc,
        mobile_number: temple.mobile_number,
        email: temple.email,
        Temple_Open_time: temple.Temple_Open_time,
        Closing_time: temple.Closing_time,
        templeId: temple.templeId,
        created_at: temple.created_at,
        updated_at: temple.updated_at,
        __v: 0
    }

    return TempleResponse;
}