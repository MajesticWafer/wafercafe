const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static('public'));

app.get('/get-roms', (req, res) => {
    const romsDir = path.join(__dirname, 'roms');
    fs.readdir(romsDir, (err, files) => {
        if (err) {
            res.status(500).send('Error reading ROMs directory');
            return;
        }
        const roms = files.map(file => path.parse(file).name); // Get filenames without extensions
        res.json(roms);
    });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
