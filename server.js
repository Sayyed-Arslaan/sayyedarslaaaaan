require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message, sourcePage } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address.' });
        }

        const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
        if (!googleScriptUrl) {
            console.error('Missing GOOGLE_SCRIPT_URL environment variable');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        // Forward to Google Apps Script as form data since it expects that usually
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        formData.append('sourcePage', sourcePage || 'Portfolio Website');

        const response = await fetch(googleScriptUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error(`Google Script returned ${response.status} ${response.statusText}`);
        }

        res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error forwarding message to Google Script:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app; // For testing purposes
