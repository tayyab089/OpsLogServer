const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection and User Schema
const connectionString = 'mongodb+srv://tayyab089:ghayab089@users.r8g9y.mongodb.net/userDB?retryWrites=true&w=majority'

mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
})

const secret = "asdslkdgnjkalsdkfjasjdglakjdsh";
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

const User = mongoose.model('User', userSchema)



// Server Routes and Code=============================================================================Start
app.get('/', (req, res) => {
  res.send('Hello World!')
});

// Registration of New User
app.post('/register', function(req,res){
  console.log(req.body)
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  })

  newUser.save(function(err){
    if(err){
      console.log(err)
      res.send('user registration failed')
    } else {
      res.send('user registered successfuly')
    }
  })

});

//Login Authentication
app.post('/login', function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({username: username}, function(err, foundUser){
    if(err){
      console.log(err);
      res.send('user nor found')
    } else {
      if(foundUser) {
        if(foundUser.password === password) {
          res.send('login successful')
        } else {res.send('Incorrect Password')}
      } else {res.send('user not found')}
    } 
  })
})
//Listening at port 3000
app.listen(port, () => {
  console.log(`opslog listening at http://localhost:${port}`)
})