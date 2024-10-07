//
//This is a backend file
//
//DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
//Installing manual: https://flint-zenith-b13.notion.site/424c21ffbb5648f4b674cb9a1472c43a?v=8377e7b70ae842dc91e2261c80e4ac75
// Copyright (c) 2024 Codylon Studios.
// 
// Import necessary modules: express, http server, socket.io
const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const session = require('express-session');


// Initialize Express application
const app = express();
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
});

// Listen for connections on port 3000
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});


// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static('public'));
//configure session
app.use(session({
  secret: "notsecret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, //10 days
  name: 'UserLogin',
}));
//Middleware to connect to account.js (and constant.js)
const account = require('./routes/account');
app.use('/account', account);


// Handle socket connection event
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

// Serve index.html when root URL is accessed
app.get('/', (res) => {
  res.sendFile(join(__dirname + '/public/index.html'));
});
