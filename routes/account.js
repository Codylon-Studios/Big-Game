//
// This is a backend file
//
// DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
// Installing manual: https://flint-zenith-b13.notion.site/424c21ffbb5648f4b674cb9a1472c43a?v=8377e7b70ae842dc91e2261c80e4ac75
// Copyright (c) 2024 Codylon Studios.
//
const { authenticateToken, pool, JWT_SECRET, saltRounds } = require('./constant');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const releaseClient = (client) => client && client.release();
const sendErrorResponse = (res, code, error = null) => {
  if (error) console.error(error);
  res.status(200).send([code.toString()]);
};

const validateUsername = (username) => /^[a-zA-Z0-9_]{4,20}$/.test(username);
const validatePassword = (password, username) => password.length >= 6 && password !== username && /(?=.*[a-zA-Z])(?=.*\d)/.test(password);

router.get('/auth', authenticateToken, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

router.post('/logout', authenticateToken, async (req, res) => {
    /* Result codes:
    0: Logout successful
    1: Internal server error
  */
  try {
    const client = await pool.connect();
    await client.query('UPDATE accounts SET sessionid = NULL WHERE username = $1', [req.user.username]);
    releaseClient(client);
    res.status(200).send('0');
  } catch (error) {
    sendErrorResponse(res, 1, error);
  }
});

router.post('/register', async (req, res) => {
    /* Result codes:
    0: Registration successful
    1: Internal server error
    2: Passwords don't match
    3: Username already used
    4: Username does not fulfil conditions (Only contain letters, numbers and underscores; 4 to 20 characters)
    5: Password does not fulfil conditions (At least 6 characters of at least 2 groups, not the username)
  */
  const { username, password, passwordRepeat } = req.body;

  if (password !== passwordRepeat) return sendErrorResponse(res, 2);
  if (!validateUsername(username)) return sendErrorResponse(res, 4);
  if (!validatePassword(password, username)) return sendErrorResponse(res, 5);

  try {
    const client = await pool.connect();
    const { rowCount } = await client.query('SELECT 1 FROM accounts WHERE username = $1', [username]);
    if (rowCount > 0) {
      releaseClient(client);
      return sendErrorResponse(res, 3);
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await client.query('INSERT INTO accounts (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    const sessionid = req.socket.id;
    await client.query('UPDATE accounts SET sessionid = $1 WHERE username = $2', [sessionid, username]);

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '10d' });
    releaseClient(client);
    res.json({ token });
  } catch (error) {
    sendErrorResponse(res, 1, error);
  }
});

router.post('/login', async (req, res) => {
    /* Result codes:
    0: Login successful
    1: Internal server error
    2: Incorrect username or password
  */
  const { username, password } = req.body;

  if (!validateUsername(username)) return sendErrorResponse(res, 2);

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    releaseClient(client);

    if (result.rows.length === 0) return sendErrorResponse(res, 2);
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '10d' });
      res.json({ token });
    } else {
      sendErrorResponse(res, 2);
    }
  } catch (error) {
    sendErrorResponse(res, 1, error);
  }
});

router.post('/delete', authenticateToken, async (req, res) => {
    /* Result codes:
    0: Deletion successful
    1: Internal server error
    2: Incorrect password
  */
  const username = req.user.username;
  const { password } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      releaseClient(client);
      return sendErrorResponse(res, 2);
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      await client.query('DELETE FROM accounts WHERE username = $1', [username]);
      releaseClient(client);
      res.status(200).send('0');
    } else {
      releaseClient(client);
      sendErrorResponse(res, 2);
    }
  } catch (error) {
    sendErrorResponse(res, 1, error);
  }
});

module.exports = router;
