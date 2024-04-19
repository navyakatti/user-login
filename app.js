

const express = require('express');
const {config}= require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const secretKey = require('./models/GenerateSecretKey');
const Note = require('./models/Note'); // Import your Note model
const notesRoutes = require('./routes/noteRoutes');
const bodyParser = require('body-parser');

const app = express();
config();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(cookieParser());

mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
// Assuming your router file is named 'notes.js'
app.use('/', notesRoutes);
const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    gmail: String,
    password: String
});
const Userdata = mongoose.model('Login', userSchema);
console.log(Userdata,'userdata')



// Replace 'your_generated_secret_key' with the actual secret key
const secretKey1 = 'secretKey';
console.log(secretKey1)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { gmail, password } = req.body;

    try {
        console.log('Login Attempt:', { gmail, password }); // Log the input data

        const user = await Userdata.findOne({ gmail: gmail });
        console.log('User Found:', user); // Log the user object

        if (!user) {
            console.log('User Not Found');
            return res.redirect('/register.html');
        }

        // Compare the entered password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Incorrect Password');
            return res.status(401).send('Incorrect password');
        }

        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Login Error:', err); // Log any errors that occur
        res.status(500).send('Server Error');
    }
});




function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ error: 'Token not provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.userId;
        next();
    });
}


// Handle registration form submission
app.post('/register', async (req, res) => {
    const { firstname, lastname, gmail, password } = req.body;

    try {
        // Hash the password before saving

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Userdata({ firstname, lastname, gmail,  password:hashedPassword });
        await newUser.save();

        // Send response to the client and redirect to login page
        // res.send('Registration successful. Redirecting to login page...');

        // Redirect to login page after 2 seconds (adjust timeout as needed)
        // setTimeout(() => {
            res.redirect('/login.html');// Redirect to your login page route
        // }, 2000);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/dashboard', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Handle logout route
app.get('/logout', (req, res) => {
    // Clear the token cookie (assuming you used cookies for authentication)
    res.clearCookie('token');
    // Redirect to the login page
    res.redirect('/login.html');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
