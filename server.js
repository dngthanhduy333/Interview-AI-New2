const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5557;

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create HTTPS server for microphone access
const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`🚀 InterviewPro Server running on https://localhost:${PORT}`);
    console.log(`📱 Microphone access enabled on HTTPS`);
    console.log(`🔗 Open: https://localhost:${PORT}`);
});

// Also start HTTP server for fallback
app.listen(PORT + 1, () => {
    console.log(`🌐 HTTP Server running on http://localhost:${PORT + 1}`);
    console.log(`⚠️  Note: Microphone may not work on HTTP`);
}); 