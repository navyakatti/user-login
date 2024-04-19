// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Registration Form
router.get('/register', (req, res) => {
    res.sendFile('views/register.html', { root: __dirname + '/../' });
});

// Register User
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await newUser.save();
        res.send('Registration successful!');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login Form
router.get('/login', (req, res) => {
    res.sendFile('views/login.html', { root: __dirname + '/../' });
});

// User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
        req.session.user = user;
        res.send('Login successful!');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

module.exports = router;
