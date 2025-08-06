const express = require('express');
const path = require('path');
const app = express();
const PORT = 5558;

// Serve static files
app.use(express.static('.'));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Mobile access: http://[YOUR_IP]:${PORT}`);
    console.log(`🎤 Microphone test: http://localhost:${PORT}/test-mic.html`);
    console.log(`🔧 Troubleshooting: http://localhost:${PORT}/microphone-fix.html`);
});

// Add CORS headers for mobile access
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}); 