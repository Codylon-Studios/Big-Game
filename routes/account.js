//
// This is a backend file
//
// DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
// Installing manual: https://flint-zenith-b13.notion.site/424c21ffbb5648f4b674cb9a1472c43a?v=8377e7b70ae842dc91e2261c80e4ac75
//
// Copyright (c) 2024 Codylon Studios.
const { pool, saltRounds } = require('./constant');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

// Reusable function for username validation
const isValidUsername = (username) => /^(\w){4,20}$/.test(username);

// Reusable function for password validation
const isValidPassword = (password, username) => {
  if (password.length < 6 || password === username) return false;
  const groups = [/\d/, /[a-z]/, /[A-Z]/].filter((regex) => regex.test(password)).length;
  return groups >= 2;
};

// Helper to handle DB connection cleanup
const withDB = async (callback) => {
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
};

// Authentication check
router.get('/auth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  if (!req.session.user) return res.status(200).send('2');  // Not logged in

  try {
    req.session.destroy((err) => {
      if (err) return res.status(500).send('1');  // Internal server error
      res.clearCookie('UserLogin');
      res.status(200).send('0');  // Logout successful
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).send('1');
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password, passwordRepeat } = req.body;

  if (password !== passwordRepeat) return res.status(200).send(['2']);
  if (!isValidUsername(username)) return res.status(200).send(['4']);
  if (!isValidPassword(password, username)) return res.status(200).send(['5']);

  try {
    await withDB(async (client) => {
      const userExists = await client.query('SELECT 1 FROM accounts WHERE username = $1', [username]);
      if (userExists.rows.length > 0) return res.status(200).send(['3']);  // Username already used

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await client.query('INSERT INTO accounts (username, password) VALUES ($1, $2)', [username, hashedPassword]);

      req.session.user = { username };
      res.status(200).send('0');  // Registration successful
    });
  } catch (error) {
    console.error('Error while storing user data:', error);
    res.status(500).send('1');  // Internal server error
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username)) return res.status(200).send('2');  // Invalid username

  try {
    await withDB(async (client) => {
      const result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
      if (result.rows.length === 0) return res.status(200).send('2');  // Username or password incorrect

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(200).send('2');  // Incorrect password

      req.session.user = { username };
      res.status(200).send('0');  // Login successful
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).send('1');  // Internal server error
  }
});

// Delete account route
router.post('/delete', async (req, res) => {
  if (!req.session.user) return res.status(200).send('3');  // Not logged in

  const { username } = req.session.user;
  const { password } = req.body;

  try {
    await withDB(async (client) => {
      const result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
      if (result.rows.length === 0) return res.status(200).send('2');  // Incorrect username or password

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(200).send('2');  // Incorrect password

      await client.query('DELETE FROM accounts WHERE username = $1', [username]);
      req.session.destroy((err) => {
        if (err) return res.status(500).send('1');  // Internal server error
        res.clearCookie('UserLogin');
        res.status(200).send('0');  // Deletion successful
      });
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).send('1');  // Internal server error
  }
});

module.exports = router;
