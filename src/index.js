require('dotenv-safe').config();

const http = require('http');
const express = require('express');
const httpProxy = require('express-http-proxy');
const app = express();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { createTerminus } = require('@godaddy/terminus');
const fs = require('fs');
let data = '';

// acessa url/nomepastapublic/nomepastadentropublic/arquivo.extensio
app.use(express.static('public'));


// verify Authorization
function verifyJWT(request, response, next) {
    const token = request.headers['x-access-token'];
    if (!token) return response.status(401).send({ auth: false, message: 'No token provided.' });

    // verifica autorizacao
    jwt.verify(token, process.env.SECRET, (error, decoded) => {
        if (error) return response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        // se tudo estiver ok, salva token no request para usar depois
        request.userId = decoded.id;
        next();
    });
}

// Fazendo o proxy para uma api 
const userServiceProxy = httpProxy('http://apiusr:3001');
const productsService = httpProxy('http://apiproduct:3002');




// middlewares 
app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/chunck', (request, response) => {

    const stream = fs.createReadStream('assets/blobimages.json');

    // stream.on('data', (chunck) => {
    //     data += chunck;
    //     console.log(data.length);
    // });

    // stream.on('open', () => {
    //     // This just pipes the read stream to the response object (which goes to the client)
    //     console.log(typeof data);

    //     stream.pipe(response);
    // });



    stream.on('data', (chunk) => {
        data += chunk;
    });



    stream.on('end', async () => {
        console.log('Data grande', data.length);
        if (data.length > Number(2361557) + 1) {
            data = '';
            console.log('Data zerada', data.length);
            return response.redirect('/chunck');
        }

        try {
            const parseDataToObject = await JSON.parse(data);
            const image = JSON.stringify(parseDataToObject.image);
            const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head> `;

            const html2 = `<body>
                <h1>IMAGE</h1>
                <img src=${image}>
            </body>
            </html>`;
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(html);
            response.write(html2);
            response.end();
        } catch (error) {
            return response.send('error');
        }
        // console.log(image);
    });

    stream.on('error', (error) => {
        response.end(error);
    });

});

// Proxy request - rotas da api
app.get('/users', verifyJWT, (request, response, next) => {
    userServiceProxy(request, response, next);
});


// Proxy request - rotas da api
app.post('/users', verifyJWT, (request, response, next) => {
    userServiceProxy(request, response, next);
});

app.get('/products', verifyJWT, (request, response, next) => {
    productsService(request, response, next);
});

// Proxy request - rotas da api
app.post('/products', verifyJWT, (request, response, next) => {
    userServiceProxy(request, response, next);
});




// authentication
app.post('/login', (request, response, next) => {
    console.log(request.body);
    if (request.body.user === 'admin' && request.body.pwd === '123') {
        // auth ok ?
        const id = 1;

        const token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 3600 // exprires 60 min 
        });

        response.statusCode = 200;
        return response.send({ auth: true, token });
    }
    response.statusCode = 401;
    response.send('Login inválido');
});



app.get('/logout', (request, response) => {
    response.statusCode = 200;
    response.send({ auth: false, token: null });
});

app.use((error, request, response, next) => {
    if (error) {
        console.log(error);
        response.statusCode = 500;
        response.send({ message: error.message });
    }
});


const port = 80;
const server = http.createServer(app);

function onSignal() {
    console.log('server is starting cleanup');
    // start cleanup of resource, like databases or file descriptors
}

async function onHealthCheck() {
    // checks if the system is healthy, like the db connection is live
    // resolves, if health, rejects if not
}

createTerminus(server, {
    healthChecks: { '/healthcheck': onHealthCheck },
    onSignal,
    signal: 'SIGINT'
});

server.listen(port);




