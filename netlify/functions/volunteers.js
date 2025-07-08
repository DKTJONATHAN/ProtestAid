const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const formData = JSON.parse(event.body);
    const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
    const repoPath = 'data/volunteers.json';

    // 1. Get current file content from GitHub
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}`;
    const getRes = await fetch(getUrl, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });

    let currentContent = [];
    let sha = null;

    if (getRes.ok) {
      const fileData = await getRes.json();
      currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
      sha = fileData.sha;
    }

    // 2. Append new data
    currentContent.push({
      ...formData,
      timestamp: new Date().toISOString()
    });

    // 3. Update file on GitHub
    const updateUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: { 
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Add new volunteer via Netlify',
        content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
        sha: sha
      })
    });

    if (!updateRes.ok) {
      throw new Error(`GitHub API error: ${updateRes.statusText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};