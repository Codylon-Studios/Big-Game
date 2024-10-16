
//
//This is the main backend file
//
//DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
// Import necessary modules: express, http server, socket.io, pg and bcrypt
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
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
const io = new Server(server);
//Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'accounts',
  password: 'postgres',
  port: 5432,
});
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

//
//APP.GET
//
//Serve index.html when root URL is accessed
app.get('/',(req,res)=>{
  res.sendFile(join(__dirname + '/public/index.html'))
});

app.get('/@/:username', function(req, res) {
  const username = req.params.username;
  res.send(`Welcome to the profile page of ${username}`);
});


//
//APP.POST
//

// Handle POST request to root route (for deleting user)(original)
app.post('/', async (req, res) => {
  /*const { deleteUsername, deletePassword } = req.body;

  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();

    // Query the database to retrieve the user with the given username
    const result = await client.query('SELECT * FROM accounts WHERE username = $1', [deleteUsername]);

    // If no user found with the given username, respond with error message
    if (result.rows.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    // Get the user data from the query result
    const user = result.rows[0];

    // Compare the provided password with the hashed password stored in the database
    const match = await bcrypt.compare(deletePassword, user.password);

    // If passwords match, delete the user from the database and respond with success message
    if (match) {
      await client.query('DELETE FROM accounts WHERE username = $1', [deleteUsername]);
      res.status(200).send('User deleted successfully');
    } else {
      // If passwords don't match, respond with error message
      res.status(401).send('Invalid username or password');
    }

    // Release the client connection
    client.release();
  } catch (error) {
    // If an error occurs, log it and respond with internal server error message
    console.error('Error deleting user:', error);
    res.status(500).send('Internal server error');
  }*/
});

// Handle POST request to /register route
app.post('/register', async (req, res) => {
  /* Result codes:
    0: Registration successful
    1: Passwords don't match
    2: Username already used
  */
  const username = req.body.username;
  const password = req.body.password;
  const passwordRepeat = req.body.passwordRepeat;

  // List of all errors, these will be returned
  let errors = []

  if (password != passwordRepeat){
    errors.push("1")
  }
  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();
    
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if username is already in use
    let result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (result.rows.length != 0) {
      errors.push("2")
    }
    else if (errors.length == 0) {
      // Insert a new row into the accounts table with the provided username and hashed password
      await client.query('INSERT INTO accounts (username, password) VALUES ($1, $2)', [username, hashedPassword]);
      //Inserts current socketid
      const sessionid = req.socket.id;
      await pool.query('UPDATE accounts SET sessionid = $1 WHERE username = $2', [sessionid, username]);
      client.release();
      res.status(200).send("0");
      return
    }
    res.status(200).send(errors)
  } catch (error) {
    // If an error occurs, log it and respond with internal server error message
    console.error('Error while storing user data', error);
    res.status(500).send('Internal database server error');
  }
});


// Handle POST request to /login route
app.post('/login', async (req, res) => {
  /* Result codes:
    0: Login successful
    1: Incorrect username or password
  */
  const { username, password } = req.body;

  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();

    // Query the database to retrieve the user with the given username
    let result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);

    // If no user found with the given username, give error
    if (result.rows.length === 0) {
      res.status(200).send("1");
    }

    // Release the client connection
    client.release();

    // Get the user data from the query result
    const user = result.rows[0];

    // Compare the provided password with the hashed password stored in the database
    const match = await bcrypt.compare(password, user.password);

    // If passwords match, update the session ID in the database and respond with success message
    if (match) {
      const sessionid = req.socket.id;
      await pool.query('UPDATE accounts SET sessionid = $1 WHERE username = $2', [sessionid, username]);
      res.status(200).send("0");
    } else {
      // If passwords don't match, respond with error message
      res.status(200).send("1");
    }
  } catch (error) {
    // If an error occurs, log it and respond with internal server error message
    console.error('Error authenticating user:', error);
    res.status(500).send('Internal server error');
  }
});
