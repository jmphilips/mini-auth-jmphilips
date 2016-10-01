'use strict';

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')


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
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', ({body: {email, password}}, res, err) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {reject(err)}
            else {resolve(hash)}
        })
    })
    .then(hash => Users.create({email, password: hash}))
    .then(() => res.render('login'))
    .catch(console.error) 
})

app.get('/home', (req, res) => {
    res.render('home');
})

app.post('/login', ({ session, body: {email, password}}, res, err) => {
    Users
        .findOne({ email })
        .then((user) => {
            if (user) {     
                bcrypt.compare(password, user.password, (err, matches) => {
                    if (matches) {
                        session.user = user
                        console.log(session.user)
                        res.render('home', {user});
                    } else {res.render('/login')}
                }) 
            
            } 
            else {res.render('login')}
        })
        .catch(console.err)
});

app.get('/logout', (req, res) => {
    req.session.destroy;
    res.render('logout')
})



mongoose.Promise = Promise;
mongoose.connect(MONGODB_URL, () => {
    app.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`)
    });
});