const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const formData = JSON.parse(event.body);
        const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
        const filePath = 'data/volunteers.json';

        // Get current data from GitHub
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
            { headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        );

        let currentData = [];
        let sha = null;

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            currentData = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
            sha = fileData.sha;
        }

        // Add new volunteer
        currentData.push(formData);

        // Update file on GitHub
        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `New volunteer: ${formData.personalInfo.fullName}`,
                    content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
                    sha: sha
                })
            }
        );

        if (!updateResponse.ok) {
            throw new Error('Failed to update GitHub file');
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