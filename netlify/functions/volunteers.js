const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Cache variables
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

exports.handler = async (event, context) => {
  // Try cache first
  if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        source: 'memory-cache',
        timestamp: new Date(lastFetchTime).toISOString(),
        data: cachedData
      })
    };
  }

  // 1. Primary: GitHub API
  try {
    const apiResponse = await axios.get(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/data/volunteers.json`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw'
        },
        timeout: 5000
      }
    );

    cachedData = apiResponse.data;
    lastFetchTime = Date.now();

    return {
      statusCode: 200,
      body: JSON.stringify({
        source: 'github-api',
        timestamp: new Date().toISOString(),
        data: cachedData
      })
    };
  } catch (githubError) {
    console.error('GitHub API Error:', githubError.message);
  }

  // 2. Fallback: Local file
  try {
    const localPath = path.join(process.cwd(), 'data', 'volunteers.json');
    if (fs.existsSync(localPath)) {
      const fileData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      
      cachedData = fileData;
      lastFetchTime = Date.now();

      return {
        statusCode: 200,
        body: JSON.stringify({
          source: 'local-file',
          timestamp: new Date().toISOString(),
          data: fileData
        })
      };
    }
  } catch (localError) {
    console.error('Local File Error:', localError.message);
  }

  // 3. Last Resort: GitHub Raw
  try {
    const rawResponse = await axios.get(
      `https://raw.githubusercontent.com/${process.env.GITHUB_REPO}/main/data/volunteers.json`,
      { timeout: 5000 }
    );

    cachedData = rawResponse.data;
    lastFetchTime = Date.now();

    return {
      statusCode: 200,
      body: JSON.stringify({
        source: 'github-raw',
        timestamp: new Date().toISOString(),
        data: cachedData
      })
    };
  } catch (finalError) {
    console.error('All Sources Failed:', finalError.message);
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "All data retrieval methods failed",
        details: {
          github_api: process.env.GITHUB_TOKEN ? "Failed" : "No token",
          local_file: fs.existsSync(path.join(process.cwd(), 'data')) ? "Failed" : "No file",
          github_raw: "Failed"
        },
        recovery: "Try again later or contact support"
      })
    };
  }
};