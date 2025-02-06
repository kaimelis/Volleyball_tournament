const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3003;

// Serve static files from the project directory
app.use(express.static(path.join(__dirname, 'htmlBuild')));
app.use('/public', express.static(path.join(__dirname, 'mix-turnyras/public')));

// Main route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mix-turnyras', 'mix_turnyras.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Display network IP addresses for easy access
    const networkInterfaces = os.networkInterfaces();
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((details) => {
            if (details.family === 'IPv4' && !details.internal) {
                console.log(`Network URL: http://${details.address}:${PORT}`);
            }
        });
    });
});