// netlify/functions/volunteers.js
const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    console.log('Fetching volunteers data...');
    const response = await axios.get(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/data/volunteers.json`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw' // Gets raw content directly
        },
        timeout: 5000 // 5 second timeout
      }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Failed to fetch volunteers",
        details: error.message
      })
    };
  }
};