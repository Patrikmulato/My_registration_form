let mongoose = require('mongoose');

//Users Schema
let userSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  pass:{
    type: String,
    required: true
  },
  passagain:{
    type: String,
    required: true
  }
});

let User  = module.exports = mongoose.model('Users' , userSchema);
