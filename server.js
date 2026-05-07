const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;


const folderPath = '/Users/manojdevaraju/Desktop/TestFolder';

// 👇 Basic Auth credentials
const USERNAME = 'manoj';
const PASSWORD = '1234';

function basicAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('Auth required');
    }

    const base64 = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const [user, pass] = decoded.split(':');

    if (user === USERNAME && pass === PASSWORD) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('Invalid credentials');
    }
}

// 1. List files
app.get('/files', basicAuth, (req, res) => {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Cannot read folder' });
        }

        res.json({ files });
    });
});

// 2. Download a file
app.get('/file/:name', basicAuth, (req, res) => {
    const fileName = req.params.name;

    const filePath = path.join(folderPath, fileName);

    // safety check (basic protection)
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    res.download(filePath); // sends file to browser
});

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});