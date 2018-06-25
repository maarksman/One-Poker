const express = require('express');
const os = require('os');
const io = require('socket.io');
const request = require('request');

const app = express();

const server = require('http').createServer(app);
const socketio = io(server);




app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));


socketio.on('connection', (client) => {
  console.log('Connected Successfully to socket! Id is:', client.id);

  //client.on('join', handleJoin);

  //client.on('leave', handleLeave);
});



server.listen(8080, function(err) {
  if (err) throw err;
  console.log("Listening on port 8080!");
});
