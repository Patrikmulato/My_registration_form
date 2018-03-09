const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/users');
let db = mongoose.connection;

//Chech connection
db.once('open' ,function() {
  console.log('Connected to MongoDB');
});

//Check Db errors
db.on('error' , function(err) {
  console.log(err);
});

//Init app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Bring in Models
let User = require('./models/Users');

//Home
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});

//Submit POST
app.post('/register' , function(req , res) {
  let user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.pass = req.body.pass;
  user.passagain = req.body.passagain;

  user.save(function (err) {
    if (err) {
      console.log(err);
    }
  })
});

//Start server
app.listen(3000 , function() {
  console.log('Server started on port 3000...');
});