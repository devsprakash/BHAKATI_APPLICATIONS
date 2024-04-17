
const axios = require('axios');

const MUX_TOKEN_ID = '21c870d8-d9ea-4fab-ad46-5546e43492b3';
const MUX_TOKEN_SECRET = 'rf8w334bZG1AgzyzcoMp4Mg9uT1Lsedi3g2SxOJtJT4PIRvt1z3+QLTFQTfCE+nhiAvrS1/JcFN'


const fetchData = async () => {

    try {

        const response = await axios.get('https://api.mux.com/data/v1/video-views', {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: MUX_TOKEN_ID,
                password: MUX_TOKEN_SECRET
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};

fetchData();
