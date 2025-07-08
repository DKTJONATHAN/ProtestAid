const axios = require('axios');

exports.handler = async () => {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/DKTJONATHAN/ProtestAid/contents/data/volunteers.json`,
            {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        // Decode base64 content
        const content = Buffer.from(response.data.content, 'base64').toString();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: content
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch volunteers" })
        };
    }
};