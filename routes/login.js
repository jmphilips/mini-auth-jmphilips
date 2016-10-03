'use strict'

const { Router } = require('express');
const router = Router();

const bcrypt = require('bcrypt');
const Users =  require('../models/users')

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', ( {session, body: { email, password }}, res, err) => {
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

module.exports = router