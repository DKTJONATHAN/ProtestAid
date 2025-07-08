const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const newVolunteer = JSON.parse(event.body);
        const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
        const filePath = 'data/volunteers.json';
        const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

        // 1. Get current file content from GitHub
        const getResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let currentData = [];
        let sha = null;

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            currentData = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
            sha = fileData.sha;
        } else if (getResponse.status !== 404) {
            throw new Error(`GitHub API error: ${getResponse.statusText}`);
        }

        // 2. Add new volunteer data
        currentData.push({
            ...newVolunteer,
            timestamp: new Date().toISOString()
        });

        // 3. Update file on GitHub
        const updateResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `New volunteer: ${newVolunteer.fullName}`,
                content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
                sha: sha
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to update file');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to process submission',
                details: error.message 
            })
        };
    }
};