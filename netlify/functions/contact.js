exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, email, message, sourcePage } = body;

        // Validation
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name, email, and message are required.' })
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email address.' })
            };
        }

        const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
        if (!googleScriptUrl) {
            console.error('Missing GOOGLE_SCRIPT_URL environment variable');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error.' })
            };
        }

        // Forward to Google Apps Script
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        formData.append('sourcePage', sourcePage || 'Portfolio Website');

        const response = await fetch(googleScriptUrl, {
            method: 'POST',
            body: formData.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error(`Google Script returned ${response.status} ${response.statusText}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Message sent successfully.' })
        };
    } catch (error) {
        console.error('Error forwarding message to Google Script:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send message.' })
        };
    }
};
