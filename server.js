//
//This is a backend file
//
//DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
//Installing manual: https://flint-zenith-b13.notion.site/424c21ffbb5648f4b674cb9a1472c43a?v=8377e7b70ae842dc91e2261c80e4ac75
// Copyright (c) 2024 Codylon Studios.
// 
// Import necessary modules: express, http server, socket.io, cors,
const cors = require('cors');
const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const bodyParser = require('body-parser');


// Initialize Express application
const app = express();

app.use(cors());
// Create an HTTP server using Express
const server = createServer(app);
// Initialize Socket.io for real-time communication
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    allowedHeaders: ['Access-Control-Allow-Origin'],
    credentials: true
  },
  allowEIO3: true,
  cookie: {
    name: "io",
    path: "/",
    httpOnly: true,
    sameSite: "lax"
  }
});
// Attach Socket.io to the HTTP server
io.attach(server);
// Listen for connections on port 3000
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});


// Store session IDs
const accounts = {};

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static('public'));
const account = require('./routes/account');
app.use('/account', account);

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

// Serve index.html when root URL is accessed
app.get('/', (req, res, next) => {
  res.sendFile(join(__dirname + '/public/index.html'));
});

// Handle POST request to root route
app.post('/', async (req, res) => { });
