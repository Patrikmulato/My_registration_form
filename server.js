const express = require('express');
const path = require('path');
var engine = require('ejs-locals');

// Init app
const app = express();

// View engine
app.set('views' , path.join(__dirname , 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

//Public folder Define
app.use(express.static(__dirname + '/public'));

//Home
app.get('/', function(req, res) {
  res.render('index', { title: 'Home' });
});

app.listen(3000 , function() {
  console.log('Server is running on 3000...');
});
