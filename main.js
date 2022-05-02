//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;


//db connection
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', (error) => console.log(error.message));
db.once('open', () => console.log('connected'));

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(
    session({
        secret: 'oompa-loompa',
        saveUninitialized: true,
        resave: false
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));
app.use('./uploads', express.static('uploads'));

//set ejs
app.set('view engine', 'ejs');

// route prefix
app.use('', require('./routes/routes'));

app.listen(PORT, () => {
    console.log(`server started at PORT ${PORT}`);
});