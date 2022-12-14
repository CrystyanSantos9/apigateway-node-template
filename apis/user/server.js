'use strict';

const express = require('express');

// Constants
const PORT = 3001;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/users', (request, response) => {
    response.send('Service Users');
});

app.post('/users', (request, response) => {
    // console.log(request.headers['x-access-token']);
    const responseTDO = request.headers;
    response.statusCode = 201;
    response.send(JSON.stringify(responseTDO));
});

app.use((error, request, response, next) => {
    if (error) {
        console.log(error);
        return response.status(500).send({ error: error.message });
    }
    next();
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);