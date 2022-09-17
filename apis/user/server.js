'use strict';

const express = require('express');

// Constants
const PORT = 3001;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/users', (request, response) => {
    console.log(request.headers['x-access-token']);
    response.send('Service Users');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);