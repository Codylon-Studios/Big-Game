//
//This is a backend file
//
//DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
//Installing manual: https://flint-zenith-b13.notion.site/424c21ffbb5648f4b674cb9a1472c43a?v=8377e7b70ae842dc91e2261c80e4ac75
// Copyright (c) 2024 Codylon Studios.
// 
const { authenticateToken, pool, JWT_SECRET, saltRounds } = require('./constant')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

//Check if the user is authenticated
router.get('/auth', authenticateToken, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

// Handle POST request to /logout route
router.post('/logout', authenticateToken, async (req, res) => {
  /* Result codes:
    0: Logout successful
    1: Internal server error
  */
  try {
    const username = req.user.username;
    const client = await pool.connect();
    // Update the sessionid to null for the user
    await client.query('UPDATE accounts SET sessionid = NULL WHERE username = $1', [username]);
    client.release();
    // Send success response
    res.status(200).send('0');
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(200).send('1');
  }
});

// Handle POST request to /register route
router.post('/register', async (req, res) => {
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
  let errors = [];
  // Check if passwords match
  if (password != passwordRepeat) {
    errors.push("2");
  }
  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if the username consists only of letters, numbers, and underscore and is between 4 and 20 characters long
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      errors.push("4");
      res.status(200).send(errors);
      return;
    }

    // Check if the password is at least 6 characters long and not equal to the username
    if (password.length < 6 || password === username) {
      errors.push("5");
    } else {
      let passwordGroups = 0;
      if (/\d/.test(password)) { passwordGroups++; }
      if (/[a-z]/.test(password)) { passwordGroups++; }
      if (/[A-Z]/.test(password)) { passwordGroups++; }

      if (passwordGroups < 2) {
        errors.push("5");
      }
    }

    // Send response
    if (errors.length > 0) {
      res.status(200).send(errors);
      return;
    }

    // Check if username is already in use
    let result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (result.rows.length != 0) {
      errors.push("3");
    } else if (errors.length === 0) {
      // Insert a new row into the accounts table with the provided username and hashed password
      await client.query('INSERT INTO accounts (username, password) VALUES ($1, $2)', [username, hashedPassword]);
      //Inserts current socketid
      const sessionid = req.socket.id;
      await pool.query('UPDATE accounts SET sessionid = $1 WHERE username = $2', [sessionid, username]);
      client.release();
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '10d' });
      res.json({ token });
      return;
    }
    res.status(200).send(errors);
  } catch (error) {
    console.error('Error while storing user data', error);
    res.status(200).send('1');
  }
});

// Handle POST request to /login route
router.post('/login', async (req, res) => {
  /* Result codes:
    0: Login successful
    1: Internal server error
    2: Incorrect username or password
  */
  const { username, password } = req.body;

  // Check if the username consists only of letters, numbers and underscore and is between 4 and 20 characters long
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
    res.status(200).send("2");
    return;
  }

  try {
    const client = await pool.connect();
    // Query the database to retrieve the user with the given username
    let result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      res.status(200).send("2");
      return;
    }
    // Get the user data from the query result
    const user = result.rows[0];
    client.release();
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '10d' });
      res.json({ token });
    } else {
      res.status(200).send("2");
      return;
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(200).send('1');
  }
});

// Handle POST request to /delete route
router.post('/delete', authenticateToken, async (req, res) => {
  /* Result codes:
    0: Deletion successful
    1: Internal server error
    2: Incorrect username or password
  */
  const username = req.user.username;
  const password = req.body.password;

  try {
    // Connect to the PostgreSQL database
    const client = await pool.connect();
    // Query the database to retrieve the user with the given username
    const result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    // Release the client connection
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
      res.status(200).send("0");
      return;
    } else {
      // If passwords don't match, respond with error message
      res.status(200).send("2");
      return;
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(200).send('1');
  }
});

module.exports = router;
