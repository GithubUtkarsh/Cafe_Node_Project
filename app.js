const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./controller/router');
const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const facebookStrategy = require('passport-facebook').Strategy;
const config = require("./config/config")
let cookieParser = require('cookie-parser');
let session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
    session({
        key: "user_sid",
        secret: "somerandomstuffs",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 1000 * 60 * 60 * 24,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new googleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
        (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
    )
);
passport.use(
    new facebookStrategy({
        clientID:config.facebookAuth.clientID,
        clientSecret:config.facebookAuth.clientSecret,
        callbackURL:config.facebookAuth.callbackURL
    },
    (accessToken,refreshToken,process,done)=>{
        return done(null,profile);
    }

)
)
passport.serializeUser((user,done)=>done(null,user));
passport.deserializeUser((user,done)=>done(null,user));


const PORT = 3000 || 5000 || 1200;
app.use('/', router);
app.listen(PORT, console.log(`App is running on port ${PORT}`));