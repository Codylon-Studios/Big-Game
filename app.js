
//
//This is the main backend file
//
//DONT TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING -BEGIN
//Creates a server with socket.io which is from a server which is
////again from another with express <-?
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
//Setting server up
const app = express();
//Creates a server based on app
const server = createServer(app);
const io = new Server(server);
//The files in the folder public will be seen in the browser (frontend)
//And all files can have access to the files in the public folder
app.use(express.static('public'))
//App gets the index.html file which is teh main file
app.get('/', (req, res) => {
  res.sendFile(join(__dirname + '/public/index.html'));
});
//--END

//Creates list of players with the objects
const accounts = {

}
//if is on connection console.log: a user is conected
//socket id (random string) generated
io.on('connection', (socket) => {
  console.log('a user connected');
  accounts[socket.id] = {
    x: 10
    //fill in more information e.g. ELO, chess rating...

  }
  //broadcast to other devices event: updtplayer,
  //the objlist players is broadcasted
  io.emit('updtplayer', accounts)
  //outputs every players object and thier attributes
  console.log(accounts);
  //At disconnect, outputs user disconnected
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    delete accounts[socket.id];
    console.log(accounts);
  });
});

//server listens on port 3000
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: 'newuser',
    host: 'localhost',
    database: 'accounts',
    password: 'password',
    port: 5432,
});

const saltRounds = 10;
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM accounts WHERE username = $1', [username]);
        client.release();

        if (result.rows.length === 0) {
            res.status(401).send('Invalid username or password');
            return;
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Update sessionid with current socketid
            const sessionid = req.socket.id;
            await pool.query('UPDATE accounts SET sessionid = $1 WHERE username = $2', [sessionid, username]);
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/', async (req, res) => {
    const { deleteUsername, deletePassword } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM accounts WHERE username = $1', [deleteUsername]);

        if (result.rows.length === 0) {
            res.status(404).send('User not found');
            return;
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(deletePassword, user.password);

        if (match) {
            await client.query('DELETE FROM accounts WHERE username = $1', [deleteUsername]);
            res.status(200).send('User deleted successfully');
        } else {
            res.status(401).send('Invalid username or password');
        }

        client.release();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal server error');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
