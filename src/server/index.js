const express = require('express');
const os = require('os');
const io = require('socket.io');
const request = require('request');

const app = express();

const server = require('http').createServer(app);
const socketio = io(server);




app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

const startdeck = [5, 6, 7, 8, 9];

//output winner from playing object, twocards is a list

function winningcard(card1, card2) {
  let higher = Math.max(card1, card2);
  let lower = Math.min(card1, card2);
  if (higher == 14 - lower) {
    return lower;
  }
  return higher;
}

//return object with winner, loser, winningcard, losingcard and bad result
function result(playedobj) {
  let toreturn = {'winner': undefined, 'loser': undefined,
                  'wincard': undefined, 'losecard': undefined, badresult: false};
  let playerlist = Object.keys(playedobj);
  let wincard = winningcard(playedobj[playerlist[0]], playedobj[playerlist[1]] );
  if (playedobj[playerlist[0]] == wincard) {
    toreturn['winner'] = playerlist[0];
    toreturn['loser'] = playerlist[1];
    toreturn['wincard'] = playedobj[playerlist[0]];
    toreturn['losecard'] = playedobj[playerlist[1]];
    return toreturn;
  } else if (playedobj[playerlist[1]] == wincard) {
    toreturn['winner'] = playerlist[1];
    toreturn['loser'] = playerlist[0];
    toreturn['wincard'] = playedobj[playerlist[1]];
    toreturn['losecard'] = playedobj[playerlist[0]];
    return toreturn;
  } else {
    toreturn[badresult] = true;
    return toreturn;
  }
}

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
  let selectedcards = {};

  client.on('gamestart', (data) => {
    socketio.to('gamechat').emit('receivemessage', 'Starting game!' );
    console.log(room.length);
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
      console.log('playerstate is: ', playerstate)
      socketio.to('gamechat').emit('dealcards', playerstate);
    }
  });


  client.on('message', (data) => {
    //console.log('message received! data is: ', data);
    socketio.to('gamechat').emit('receivemessage', data.msg );
  });

  client.on('cardselect', (data) => {
    console.log('selectedcards is: ', selectedcards);

    socketio.to('gamechat').emit('receivemessage', "Card Clicked!" );
    //check if card already picked
    if (selectedcards[data.senderid]) {
      socketio.to('gamechat').emit('receivemessage', "Card already picked by player!" );
    }
    else { //check if card is a number
      let cardval = parseInt(data.card);
      if (!isNaN(cardval)) {
        selectedcards[data.senderid] = cardval;
        if (Object.keys(selectedcards).length < 2) {
          socketio.to('gamechat').emit('receivemessage', "Awaiting other player!" );
          socketio.to('gamechat').emit('cardpicked', selectedcards);
        } else {
          //resolve the round
          let outcome = result(selectedcards);
          if (!outcome.badresult) {
            socketio.to('gamechat').emit('receivemessage',
              `${outcome.winner} won with card ${outcome.wincard} against card
              ${outcome.losecard} of ${outcome.loser}`);
          } else {
            socketio.to('gamechat').emit('receivemessage', "Messed up results" );
          }
        }
      }
    }
    console.log('selectedcards is after running: ', selectedcards);
  });

  client.on('opponentplay', (data) => {
    let otherid = Object.keys(data)[0];
    selectedcards[otherid] = data[otherid];
  });

  //client.on('join', handleJoin);

  //client.on('leave', handleLeave);
});



server.listen(8080, function(err) {
  if (err) throw err;
  console.log("Listening on port 8080!");
});
