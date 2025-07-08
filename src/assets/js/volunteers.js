const { Octokit } = require("@octokit/rest");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Get the current file content
    const repoInfo = process.env.GITHUB_REPO.split('/');
    const owner = repoInfo[0];
    const repo = repoInfo[1];
    const path = "data/volunteers.json";

    let currentContent = [];
    let sha = null;

    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      const content = Buffer.from(fileData.content, 'base64').toString('utf8');
      currentContent = JSON.parse(content);
      sha = fileData.sha;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      // File doesn't exist yet, we'll create it
    }

    // Add new volunteer data
    currentContent.push({
      ...data,
      timestamp: new Date().toISOString(),
    });

    // Update the file on GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Add new volunteer signup",
      content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
      sha,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Volunteer data saved successfully" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: "Failed to save volunteer data",
        error: error.message 
      }),
    };
  }
};