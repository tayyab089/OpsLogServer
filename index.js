require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection and User Schema
const connectionString = process.env.connectionString
mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  isAdmin: {
    type: Boolean,
    required: [true, 'Authentication Level is required']
  },
  token: { type: String }
})

const User = mongoose.model('User', userSchema)

// Server Routes and Code
app.get('/', (req, res) => {
  res.send('Hello World!')
});

// Registration of New User
app.post('/register', function(req,res){
  console.log(req.body)
  if (!(req.body.id && req.body.password)) {
    res.send(JSON.stringify("All inputs are required"));
    return;
  }

  User.exists({username: req.body.id}).then(exists => {
    if (exists) {
      console.log(exists)
      res.send(JSON.stringify('User already exists'))
      return;
    }
    const newUser = new User({
        username: req.body.id,
        password: md5(req.body.password),
        isAdmin: req.body.isAdmin,
      })

      newUser.save(function(err){
        if(err){
          console.log(err)
          res.send(JSON.stringify('User registration failed'))
        } else {
          res.send(JSON.stringify('User registered successfuly'))
        }
      })
    });
});


app.post("/login", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const username = req.body.id;
    const password = md5(req.body.password);

    // Validate user input
    if (!(username && password)) {
      res.status(400).send(JSON.stringify("All inputs are required"));
    }
    // Validate if user exist in our database
    const user = await User.findOne({ username });

    if (user && user.password === password) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;
      console.log(user)

      // user
      res.status(200).json(user);
    }
    res.status(400).send(JSON.stringify("Invalid Credentials"));
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

//Get All Registered Users
app.get('/users', function(req,res){
  User.find({}, function(err, foundUsers){
    if(err){
      console.log(err)
      res.send(JSON.stringify('user search failed'))
    } else {
      res.send(JSON.stringify(foundUsers))
    }
  })
});

//Delete User
app.post('/users', function(req,res){
  console.log(req.body)
  User.findByIdAndDelete(req.body._id, function(err, foundUser){
    if(err) {
      res.send(JSON.stringify('Could not connect to server'))
    } else if(foundUser === null) {res.send(JSON.stringify('User Not Found'))
  } else { res.send(JSON.stringify(`${foundUser.username} deleted successfully`))}
  })
})
//Listening at port 3000
app.listen(port, () => {
  console.log(`opslog listening at http://localhost:${port}`)
})