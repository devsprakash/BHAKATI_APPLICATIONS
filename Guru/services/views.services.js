const axios = require('axios')
const { getViewerCountsToken } = require('../../services/muxSignInKey')


exports.getData = async (assetId) => {

    try {
            const token = await getViewerCountsToken(assetId);
            const response = await axios.get(`https://stats.mux.com/counts?token=${token}`);
            return response.data; // Assuming you want to return the response data
    
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error for handling elsewhere
    }
};