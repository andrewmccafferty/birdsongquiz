const fs = require('fs');
const path = require('path');

const version = process.env.CURRENT_APP_VERSION || 'dev';
const htmlPath = path.join(__dirname, './index.html');
const outputPath = path.join(__dirname, './dist/index.html');

// Read the HTML file
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace the placeholder
html = html.replace(/{CURRENT_APP_VERSION}/g, version);

// Ensure dist directory exists
const distDir = path.dirname(outputPath);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the processed HTML
fs.writeFileSync(outputPath, html);

console.log(`Built index.html with version: ${version}`);