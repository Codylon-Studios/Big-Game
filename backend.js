
//
//This is the main backend file
//
//DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
// Import necessary modules: express, http server, socket.io, pg and bcrypt
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
// Initialize Express application
const app = express();
// Define saltRounds for bcrypt hashing
const saltRounds = 10;
// Create an HTTP server using Express
const server = createServer(app);
// Initialize Socket.io for real-time communication
const io = new Server(server, {
  cookie: {
    name: "io",
    path: "/",
    httpOnly: true,
    sameSite: "lax"
  }
});
//Create a PostgreSQL connection pool
const dbConfig = JSON.parse(fs.readFileSync('db_config.json'));

const pool = new Pool(dbConfig);
// Make `pool` available to other parts of your application as needed
module.exports = pool;
// Store session IDs
const accounts = {};

//
//CONNECTION
//
// Handle socket connection event
io.on('connection', (socket) => {
  console.log('a user connected');
  // Add the connected user to the accounts object
  accounts[socket.id] = {};
  // Emit 'updtplayer' event to update clients with current player information
  io.emit('updtplayer', accounts);
  console.log(accounts);
  // Handle socket disconnection event
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    // Remove the disconnected user from the accounts object
    delete accounts[socket.id];
    console.log(accounts);
  });
});

// Listen for connections on port 3000
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

//
//APP.USE
//
// Set up body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static('public'));

app.use(session({
  store: new pgSession({
    pool : pool,                // Connection pool
    tableName : 'user_sessions'   // Use another table-name than the default "session" one
    // Insert connect-pg-simple options here
  }),
  secret: process.env.FOO_COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  name: 'sessionid',
  // Insert express-session options here
}));

//
//APP.GET
//
//Serve index.html when root URL is accessed
app.get('/',(req,res, next)=>{
  req.session.foo = 'foo'
  console.log(req)
  res.sendFile(join(__dirname + '/public/index.html'))
});
// Add a new route to check if the user is authenticated
app.get('/auth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});


//
//POST
//
// Handle POST request to /logout route
app.post('/logout', (req, res) => {
  /* Result codes:
    0: Registration successful
    1: Internal server error
  */
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(200).send('1');
    } else {
      res.status(200).send('0');
    }
  });
});
// Handle POST request to root route (for deleting user)(original)
app.post('/', async (req, res) => {
});

// Handle POST request to /register route
app.post('/register', async (req, res) => {
  /* Result codes:
    0: Registration successful
    1: Internal server error
    2: Passwords don't match
    3: Username already used
    4: Username does not fulfil conditions (Only contain letters, numbers and underscores; 4 to 20 characters)
    5: Password does not fulfil conditions (At least 6 characters of at least 2 groups, not the username)
  */
  const username = req.body.username;
  const password = req.body.password;
  const passwordRepeat = req.body.passwordRepeat;

  // List of all errors, these will be returned
  let errors = []

  if (password != passwordRepeat){
    errors.push("2")
  }
  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if the username consists only of letters, numbers and underscore and is between 4 and 20 characters long
    let usernameRegexp = /^([a-z]|[A-Z]|\d|_)+$/
    if (! (usernameRegexp.test(username) && username.length >= 4 && username.length <= 20)) {
      errors.push("4")
      res.status(200).send(errors)
      return
    }

    // Check if the password is at least 6 characters of at least 2 groups long and not the username
    if (password.length < 6) {
      errors.push("5");
    }
    else if (password == username) {
      errors.push("5");
    }
    else {
      let passwordGroups = 0;
      if (/\d/.test(password)) {passwordGroups += 1};
      if (/[a-z]/.test(password)) {passwordGroups += 1};
      if (/[A-Z]/.test(password)) {passwordGroups += 1};
      if (passwordGroups == 0) {
        errors.push("5");
      }
      else if (passwordGroups == 1) {
        let passwordCopy = password;
        passwordCopy.replaceAll(/\d/g, "");
        passwordCopy.replaceAll(/[a-z]/g, "");
        passwordCopy.replaceAll(/[A-Z]/g, "");
        if (passwordCopy.length == 0) {
          errors.push("5");
        }
      }
    }
    

    // Check if username is already in use
    let result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (result.rows.length != 0) {
      errors.push("3")
    }
    else if (errors.length === 0) {
      // Insert a new row into the accounts table with the provided username and hashed password
      await client.query('INSERT INTO accounts (username, password) VALUES ($1, $2)', [username, hashedPassword]);
      //Inserts current socketid
      const sessionid = req.socket.id;
      await pool.query('UPDATE accounts SET sessionid = $1 WHERE username = $2', [sessionid, username]);
      client.release();
      req.session.user = { username };
      res.status(200).send("0");
      return
    }
    res.status(200).send(errors)
  } catch (error) {
    // If an error occurs, log it and respond with internal server error message
    console.error('Error while storing user data', error);
    res.status(200).send('1');
  }
});


// Handle POST request to /login route
app.post('/login', async (req, res) => {
  /* Result codes:
    0: Login successful
    1: Internal server error
    2: Incorrect username or password
  */
  const { username, password } = req.body;

  // Check if the username consists only of letters, numbers and underscore and is between 4 and 20 characters long
  let usernameRegexp = /^([a-z]|[A-Z]|\d|_)+$/
  if (! (usernameRegexp.test(username) && username.length >= 4 && username.length <= 20)) {
    res.status(200).send("2");
    return
  }

  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();
    // Query the database to retrieve the user with the given username
    let result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    // If no user found with the given username, give error
    if (result.rows.length === 0) {
      res.status(200).send("2");
      return;
    }
    // Get the user data from the query result
    const user = result.rows[0];
    // Release the client connection
    client.release();
    // Compare the provided password with the hashed password stored in the database
    const match = await bcrypt.compare(password, user.password);
    // If passwords match, update the session ID in the database and respond with success message
    if (match) {
      const sessionid = req.socket.id;
      await pool.query('UPDATE accounts SET sessionid = $1 WHERE username = $2', [sessionid, username]);
      req.session.user = { username };
      res.status(200).send("0");
    } else {
      // If passwords don't match, respond with error message
      res.status(200).send("2");
      return;
    }
  } catch (error) {
    // If an error occurs, log it and respond with internal server error message
    console.error('Error authenticating user:', error);
    res.status(200).send('1');
  }
});


// Handle POST request to /delete route
app.post('/delete', async (req, res) => {
  /* Result codes:
    0: Deletion successful
    1: Internal server error
    2: Incorrect username or password
  */
  const { username, password } = req.body;

  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();
    // Query the database to retrieve the user with the given username
    const result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    // Release the client connection
    client.release();
    // If no user found with the given username, give error
    if (result.rows.length === 0) {
      res.status(200).send("2");
      return;
    }
    // Get the user data from the query result
    const user = result.rows[0];
    // Compare the provided password with the hashed password stored in the database
    const match = await bcrypt.compare(password, user.password);
    // If passwords match, delete the account and respond with success message
    if (match) {
      await pool.query('DELETE FROM accounts WHERE username = $1', [username]);
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(200).send('1');
        } else {
          res.status(200).send("0");
        }
      });
      return;
    } else {
      // If passwords don't match, respond with error message
      res.status(200).send("2");
      return;
    }
  } catch (error) {
    // If an error occurs, log it and respond with internal server error message
    console.error('Error authenticating user:', error);
    res.status(200).send('1');
  }
});
