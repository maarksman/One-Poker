const express = require('express');
const os = require('os');
const io = require('socket.io');
const request = require('request');

const app = express();

const server = require('http').createServer(app);
const socketio = io(server);


// NEXT TASK REFACTOR CODE TO USE GAME 'CLASS' AND EMITS PASSING 'PLAYERSTATE' OBJECT
// INSTEAD OF TURN-SPECIFIC CALLS


app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

const startdeck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
//const startdeck = [5, 6, 7, 8, 9];

//output winner from playing object, twocards is a list

//using classes to make the game

class Game {
  constructor(id_1, id_2, room) {
    this.id_1 = id_1;
    this.id_2 = id_2;
    this.room = room;
    this.deck = startdeck;
    var playerstate1 = new Playerstate(id_1);
    var playerstate2 = new Playerstate(id_2);
    let firstid = id_1;
    let secondid = id_2;
    this.roundstate = {};
    this.roundstate[id_1] = playerstate1;
    this.roundstate[id_2] = playerstate2;
  }

  updateplayerstate(id, newstate) {
    this.roundstate[id].updateturnstate(newstate);
  }

  deal() {
      let userids = Object.keys(this.roundstate);
      for (let j =0;j<userids.length;j++) {
        let hand = [];
        for (let i=0; i<2; i++) {
          let cardindex = randindex(this.deck);
          hand.push(this.deck[cardindex]);
          this.deck.splice(cardindex, 1);
        }
        this.roundstate[userids[j]].sethand(hand);
        hand = [];
      }
  }

  start() {
    this.deal();
  }

  resolvehand() {
    let toreturn = {'winner': undefined, 'loser': undefined,
                    'wincard': undefined, 'losecard': undefined, 'badresult': false};
    let playerlist = Object.keys(this.roundstate);
    let selected0 = this.roundstate[playerlist[0]].selected();
    let selected1 = this.roundstate[playerlist[1]].selected();
    if (selected0 != undefined && selected1 != undefined) {
      let wincard = winningcard(selected0, selected1);
      if (selected0 == wincard) {
        toreturn['winner'] = playerlist[0];
        toreturn['loser'] = playerlist[1];
        toreturn['wincard'] = selected0;
        toreturn['losecard'] = selected1;
        return toreturn;
      } else if (selected1 == wincard) {
        toreturn['winner'] = playerlist[1];
        toreturn['loser'] = playerlist[0];
        toreturn['wincard'] = selected1;
        toreturn['losecard'] = selected0
        return toreturn;
      } else {
        toreturn[badresult] = true;
        toreturn['message'] = 'Messed up comparing gotten card cards and outputting winner';
        return toreturn;
      }
    } else {
      toreturn['badresult'] = true;
      toreturn['message'] = 'Messed up- at least on selected card undefined';
      return toreturn;
    }
  }

}

class Playerstate {
  constructor(socketid) {
  this.current = {"hand": [], "selected": undefined, "tucked": undefined};
  this.history = {};
  this.playerid = socketid;
  this.name = "";
  this.cardpicked = false;
  }

  sethand(cards) {
    this.current.hand = cards;
  }

  updateturnstate(turnstate) {
    this.current["hand"] = turnstate['hand'];
    this.current["tucked"] = turnstate['tucked'];
    this.current["selected"] = turnstate['selected'];
    if (this.current["selected"] != undefined) {
      this.cardpicked = true;
    }
  }

  selected() {
    return this.current.selected;
  }
}


function winningcard(card1, card2) {
  let higher = Math.max(card1, card2);
  let lower = Math.min(card1, card2);
  if (higher == 14 - lower) {
    return lower;
  }
  return higher;
}

//return object with winner, loser, winningcard, losingcard and bad result
/*
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
*/

//function for random intget
function randindex(array) {
  return Math.floor(Math.random() * array.length);
}

socketio.on('connection', (client) => {
  console.log('Connected Successfully to socket! Id is:', client.id);
  client.join('gamechat');

  let room = socketio.sockets.adapter.rooms['gamechat'];
  let userids = Object.keys(room.sockets);
  console.log('num users is: ', room.length);
  console.log('logging room keys', userids );

  client.on('gamestart', (data) => {
    let gameroomname = 'gamechat';
    let gameroom = socketio.sockets.adapter.rooms[gameroomname];
    if (gameroom.length == 2) {
      let userids = Object.keys(gameroom.sockets);
      game = new Game(userids[0], userids[1], gameroomname);
      //console.log('game is: ', game);
      game.start();
      socketio.to('gamechat').emit('receivemessage', "Starting game!" );

      for (let i=0;i<userids.length;i++) {
        /*console.log('game.roundastate is: ', game.roundstate);
        console.log('userids[i] is', userids[i]);
        console.log('game.roundstate.current for this id is:', game.roundstate[userids[i]].current )
        */
        console.log('game before deal is: ', game);
        socketio.to(userids[i]).emit('dealcards', game.roundstate[userids[i]].current);
      }
      //game.messageall('Starting game!');
    }


    /*
    socketio.to('gamechat').emit('receivemessage', 'Starting game!' );
    console.log('room.length is: ', room.length);
    if (room.length == 2) {
      userids = Object.keys(room.sockets);
      let cards = startdeck;

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
    */
  });


  client.on('message', (data) => {
    //console.log('message received! data is: ', data);
    socketio.to('gamechat').emit('receivemessage', data.msg );
  });

  client.on('cardselect', (data) => {
    console.log('data got in cardselect is: ', data);
    let userids = Object.keys(game.roundstate);
    let indexof = userids.indexOf(data.senderid);
    userids.splice(indexof);
    let otherid = userids[0]
    socketio.to('gamechat').emit('receivemessage', `Card Clicked! by id: ${data.senderid}` );
    //check if card already picked
    if (game.roundstate[data.senderid].selected() !== undefined) {
      socketio.to(data.senderid).emit('receivemessage', 'Card already selected for round!');
    } else {
      game.updateplayerstate(data.senderid, data.playerstate);
      let themessage = `player ${data.senderid} card set!`
      socketio.to(data.senderid).emit('receivemessage', themessage);
      socketio.to(otherid).emit('cardpicked', data);

    }


    //check if card already picked
    /*
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
    */
  });

  client.on('opponentplay', (data) => {
    //amend the game class with the opponents choice
    console.log('fired opponentplay emit! data is: ', data);
    let userids = Object.keys(game.roundstate);
    game.updateplayerstate(data.senderid, data.playerstate);
    console.log('logging both roundstates: ' );
    for (let k = 0; k< userids.length; k++) {
      console.log(`game.roundstate for id ${userids[k]}  is: `, game.roundstate[userids[k]]);
    }
    if (game.roundstate[userids[0]].selected() != undefined &&
        game.roundstate[userids[1]].selected() != undefined ) {
          let result = game.resolvehand();
          if (result.badresult) {
            console.log("We messed up! message is:", result.message);
          } else {
            socketio.to('gamechat').emit('receivemessage',
              `${result.winner} won with card ${result.wincard} against card
              ${result.losecard} of ${result.loser}`);
          }
    }
  });

  //client.on('join', handleJoin);

  //client.on('leave', handleLeave);
});



server.listen(8080, function(err) {
  if (err) throw err;
  console.log("Listening on port 8080!");
});
