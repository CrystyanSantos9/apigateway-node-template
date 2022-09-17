require('dotenv-safe').config();

const http = require('http');
const express = require('express');
const httpProxy = require('express-http-proxy');
const app = express();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');



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
const userServiceProxy = httpProxy('http://localhost:3001');
const productsService = httpProxy('http://localhost:3002');


// Proxy request - rotas da api
app.get('/users', verifyJWT, (request, response, next) => {
    userServiceProxy(request, response, next);
});

app.get('/products', verifyJWT, (request, response, next) => {
    productsService(request, response, next);
});

// middlewares 
app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// authentication
app.post('/login', (request, response, next) => {
    console.log(request.body);
    if (request.body.user === 'admin' && request.body.pwd === '123') {
        // auth ok ?
        const id = 1;

        const token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 300 // exprires 5 min 
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


const server = http.createServer(app);
server.listen(8080);




