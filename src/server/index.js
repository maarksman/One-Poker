const express = require('express');
const os = require('os');
const io = require('socket.io');
const request = require('request');

const app = express();

const server = require('http').createServer(app);
const socketio = io(server);




app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

// Making function takes in id's returns proper hand

//function for random intget
function randindex(array) {
  return Math.floor(Math.random() * array.length);
}

socketio.on('connection', (client) => {
  console.log('Connected Successfully to socket! Id is:', client.id);
  client.join('gamechat');

  let room = socketio.sockets.adapter.rooms['gamechat'];
  let userids = Object.keys(room.sockets)
  console.log('num users is: ', room.length);
  console.log('logging room keys', userids );
  let playerstate={};
  let selectedcards = [];



  client.on('gamestart', (data) => {
    console.log('are we here?');
    if (room.length == 2) {
      userids = Object.keys(room.sockets);
      let cards = [5, 6, 7, 8, 9];

      for (j=0;j<room.length;j++) {
        let hand = [];
        for (i=0; i<userids.length; i++) {
          let cardindex = randindex(cards);
          hand.push(cards[cardindex]);
          cards.splice(cardindex, 1);
        }
        playerstate[userids[j]] = hand;
        hand = [];
      }
      socketio.to('gamechat').emit('dealcards', playerstate);
    }
  });


  client.on('message', (data) => {
    console.log('message received! data is: ', data);
    socketio.to('gamechat').emit('receivemessage', data.msg );
  });

  client.on('cardselect', (data) => {
    let tosend = `${data.senderid} selected card: ${data.card}`;
    socketio.to('gamechat').emit('receivemessage', tosend );
  });

  //client.on('join', handleJoin);

  //client.on('leave', handleLeave);
});



server.listen(8080, function(err) {
  if (err) throw err;
  console.log("Listening on port 8080!");
});
