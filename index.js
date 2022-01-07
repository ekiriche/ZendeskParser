const express = require('express');
const app = express();
const port = 5000;
const Parser = require('./src/parser.js');

app.get('/', (req, res) => {
    const parser = new Parser();
    parser.fetchAll();
    res.send('doing stuff');
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});