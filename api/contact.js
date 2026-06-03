export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        // Forward to Google Apps Script
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

        return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error forwarding message to Google Script:', error);
        return res.status(500).json({ error: 'Failed to send message.' });
    }
}
