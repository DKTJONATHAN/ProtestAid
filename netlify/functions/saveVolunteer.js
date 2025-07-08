const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const repo = process.env.GITHUB_REPO || 'DKTJONATHAN/ProtestAid';
        const filePath = 'data/volunteers.json';
        const branch = 'main';

        // 1. Get current file content
        const getUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let currentContent = [];
        let sha = null;

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
            sha = fileData.sha;
        } else if (getResponse.status !== 404) {
            throw new Error('Failed to fetch current file');
        }

        // 2. Add new volunteer
        currentContent.push(data);

        // 3. Update file
        const updateUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add new volunteer: ${data.fullName}`,
                content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
                sha: sha,
                branch: branch
            })
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Failed to update file');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Volunteer added successfully!' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};