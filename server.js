const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt')
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});


const PORT = 3000;

let users = [
    {
        id: 1,
        username: 'Quatoria',
        password: '123'
    },
    {
        id: 2,
        username: 'Abadi',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    for (let user of users){
        if (username == user.username && password == user.password){
            let token = jwt.sign({id: user.id, username: user.username }, secretKey, { expiresIn: '7d'});
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else{
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is not correct'
            });
        }
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next){
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            err
        });
    }
    else{
        next(err);
    }
});

app.listen(PORT, () =>{
    console.log(`Serving on port ${PORT}`);
});