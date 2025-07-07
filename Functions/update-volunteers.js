const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }

    try {
        const newVolunteer = JSON.parse(event.body);
        
        // Initialize Octokit with environment variables
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        // Repository information
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        const dataPath = 'src/data/volunteers.json';
        
        // Get current file content
        let currentContent = [];
        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path: dataPath,
            });
            
            // Decode content from base64
            const content = Buffer.from(data.content, 'base64').toString('utf8');
            currentContent = JSON.parse(content);
        } catch (error) {
            if (error.status !== 404) throw error;
            // File doesn't exist yet, we'll create it
        }

        // Add new volunteer
        currentContent.push(newVolunteer);

        // Update file on GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: dataPath,
            message: `Add new volunteer: ${newVolunteer.fullName}`,
            content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
            sha: await getFileSha(octokit, owner, repo, dataPath)
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Volunteer data saved successfully" })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to save volunteer data" })
        };
    }
};

async function getFileSha(octokit, owner, repo, path) {
    try {
        const { data } = await octokit.repos.getContent({ owner, repo, path });
        return data.sha;
    } catch (error) {
        if (error.status === 404) return undefined; // File doesn't exist yet
        throw error;
    }
}