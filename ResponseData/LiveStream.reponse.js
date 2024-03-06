


exports.LiveStreamingResponse = (stream) => {

    const response = {
        _id: stream._id,
        status: stream.status,
        startTime: stream.startTime,
        created_at: stream.created_at,
        updated_at: stream.updated_at,
        description:stream.description,
        title:stream.title,
        playBackId: stream.muxData.playBackId,
        status: stream.muxData.status,
        stream_key:stream.muxData.stream_key,
        reconnect_window: stream.muxData.reconnect_window,
        max_continuous_duration: stream.muxData.max_continuous_duration,
        latency_mode: stream.muxData.latency_mode,
        LiveStreamingId: stream.muxData.LiveStreamingId,
    }
    return response;
}

exports.LiveStreamingEndResponse = (stream) => {

    const response = {
        _id: stream._id,
        status: stream.status,
        endTime: stream.endTime,
        playBackId: stream.muxData.playBackId,
        LiveStreamingId: stream.muxData.LiveStreamingId,
    }
    return response;
}