
const axios = require('axios');

// Replace these values with your actual Mux token ID and secret
const MUX_TOKEN_ID = 'd2681bb6-48ad-4eae-81eb-2796b232f17f';
const MUX_TOKEN_SECRET = 'N0AxtIqmY/quZ5Tlm2lP8U/ktn2H4YjPRWzibqa0TFB3n4ci6i4+8jLfnL74X4Ihgukc69RnFJ+';

// Function to retrieve input information for a specific asset
async function getAssetInputInfo(assetId) {

  try {

    const response = await axios.get(
      `https://api.mux.com/video/v1/assets`,
      {
        auth: {
          username: MUX_TOKEN_ID,
          password: MUX_TOKEN_SECRET
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error retrieving input info:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Example usage:
getAssetInputInfo()
  .then(inputInfo => {
    console.log('Input Information:', inputInfo.data);
  })
  .catch(error => {
    console.error('Failed to retrieve input info:', error);
  });
