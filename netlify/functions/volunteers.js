const { Octokit } = require("@octokit/rest");

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Initialize Octokit with your GitHub token
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        // Get the current content of the file
        const owner = "DKTJONATHAN";
        const repo = "ProtestAid";
        const path = "data/volunteers.json";

        let currentData = [];
        try {
            const { data: fileData } = await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: 'main'
            });
            
            // Decode the content from base64
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            currentData = JSON.parse(content);
        } catch (error) {
            if (error.status !== 404) throw error;
            // File doesn't exist yet, we'll create it
        }

        // Add new volunteer data
        currentData.push(data);

        // Update the file on GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Add new volunteer: ${data.fullName}`,
            content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
            branch: 'main'
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Volunteer data saved successfully" })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: "Failed to save volunteer data",
                error: error.message 
            })
        };
    }
};