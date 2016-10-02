'use strict';

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser')


const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/miniauth';

app.use(bodyParser.urlencoded({ extended: false}))

const Users = require('./models/user');

app.set('view engine', 'pug')

app.use(express.static('views'));
app.use(express.static('lib'))
app.use(session({
    store: new RedisStore({url: process.env.REDIS_URL}  || 'redis://localhost:6379'),
    resave: false,
    saveUnitialized: false, 
    secret: 'thesecretkey'
}));

app.use((req, res, next) => {
    if (req.session.email)  {
        app.locals.email = req.session.email;
    }
    next();
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', ( {session, body: { email, password }}, res, err) => {

    Users.findOne({ email })
        .then(user => {
            if ( user && password === user.password ) {
                session.user = user;
                res.render('home')
            } else {
                res.render('login')
            }
        });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res, err) => {
    console.log(req.body)

    Users
        .create(req.body)
        .then(() => res.render('login'))
        .catch(err)
});

app.get('/home', (req, res) => {
    res.render('home');
});





mongoose.Promise = Promise;
mongoose.connect(MONGODB_URL, () => {
    app.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`)
    });
});