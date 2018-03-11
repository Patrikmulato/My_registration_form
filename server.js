const express = require('express');
const path = require('path');
var engine = require('ejs-locals');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const config = require('./config/database');
const LocalStrategy = require('passport-local').Strategy;

mongoose.connect('mongodb://localhost/users');
let db = mongoose.connection;

//Check Connections
db.once('open', function(){
  console.log("Connected to MongoDB");
});

//Check for db Errors
db.on('error', function (err) {
  console.log(err);
});

// Init app
const app = express();

//Bring in models
let User = require('./models/usermodel');

// View engine
app.set('views' , path.join(__dirname , 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public folder
app.use(express.static(path.join(__dirname , 'public')));

// Express Session Middelware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param , msg , value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param: formParam,
      msg : msg,
      value: value
    };
  }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


//Home
app.get('/', function(req, res) {
  res.render('index', { title: 'Home' });
});


// Register Route
app.get('/register' , function(req , res) {
  res.render('register', { title: 'Register' });
});

app.post('/register' , function(req , res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name' , 'Name is required').notEmpty();
  req.checkBody('email' , 'Email is required').notEmpty();
  req.checkBody('email' , 'Email is required').isEmail();
  req.checkBody('password' , 'Password is required').notEmpty();
  req.checkBody('password2' , 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', { title: 'Register' }, {
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      password: password
    });

    bcrypt.genSalt(10 , function( err , salt) {
      bcrypt.hash(newUser.password , salt , function(err , hash) {
        if (err) {
          console.log(err);
        } else {
          newUser.password = hash;
          newUser.save(function(err) {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash("success", "You are registered");
              res.redirect('/register');
            }
          });
        }
      });
    });
  }
});


// Login Route
app.get('/login' , function(req , res) {
  res.render('login', { title: 'Login' });
});

// Login Process
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    let query = {email:email};
    User.findOne( query , function(err , user) {
        if (err) {
          throw err;
        }
        if(!user){
          return done(null ,false , {message: 'Wrong email'});
        }

        //Match Password
        bcrypt.compare(password , user.password , function(err , isMatch) {
          if (err) {
            throw err;
          }
          if (isMatch) {
            return done(null , user);
          } else {
            return done(null ,false , {message: 'Wrong password'});
          }
        });
      });
  }));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//Logout Process
app.get('/logout' , function(req , res) {
  req.logout();
  req.flash('success' , 'You are logged out');
  res.redirect('/login');
});

app.listen(3000 , function() {
  console.log('Server is running on 3000...');
});
