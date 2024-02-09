
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
    console.log('user disconnected');
    console.log(accounts);
  });
});

//server listens on port 3000
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
console.log("Active players: ")
console.log(accounts);