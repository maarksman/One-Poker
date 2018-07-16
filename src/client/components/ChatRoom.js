const datetime = require('node-datetime');
import React, { Component } from 'react';
//import io from 'socket.io-client';
const io = require('socket.io-client');


export default class ChatRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {chat_history: [], typed: '',
                  chat_id: undefined,
                  playerstate: {hand:[undefined, undefined],
                  selected: undefined, tucked: undefined}
                  };
    this.onChatSubmit = this.onChatSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onCardSelect = this.onCardSelect.bind(this);
    this.beginGame = this.beginGame.bind(this);
    const socket = io('http://localhost:8080');
    this.socket = socket;
  }

  componentDidMount() {
    //const testsocket = socket.connect('http://localhost:8080');
    this.socket.on('connect', () => {
      console.log('this.socket is: ', this.socket)
      console.log('connected to server with id:', this.socket.id);
      this.setState({chat_id: this.socket.id});

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('dealcards', (newstate) => {
        console.log('Got playerstate of: ', newstate);
        this.setState({playerstate: newstate});
        console.log('this.state.playerstate is now: ', this.state.playerstate);
      });

      //handle receiving messages
      this.socket.on('receivemessage', (text) => {
        this.setState({chat_history: this.state.chat_history.concat(text)});
      });

      this.socket.on('cardpicked', (data) => {
        this.socket.emit('opponentplay', data);
      });

    });
    //testsocket.on('message', (msg) => {this.state.chat_history.concat} )
  }

  onChatSubmit(event) {
    if (!this.state.chat_id) {
      return;
    }
    else {
      console.log('chat submitted!');
      let sendmessage = `${this.state.chat_id}: ${this.state.typed}`
      var newarray = this.state.chat_history.concat(sendmessage)
      event.preventDefault();
      //alter state to add message history
      //alert('Submitted:' + this.state.typed);
      this.socket.emit('message', {senderid: this.socket.id, msg: sendmessage});
      //this.setState({chat_history: newarray})
      this.setState({typed:''});
      }
  }

  onInputChange(event) {
    this.setState({typed: event.target.value})
  }

  onCardSelect(event) {
    //event.preventDefault();
    let cardvalue = parseInt(event.target.getAttribute('data-value'));
    let tosend = {senderid: this.socket.id, playerstate: {selected: undefined,
                  tucked: undefined, hand: this.state.playerstate.hand} }
    console.log('card is', cardvalue );
    //find tucked card
    let thehand = tosend.playerstate.hand.slice();
    console.log('thehand is: ', thehand);
    let selectedindex = thehand.indexOf(cardvalue);
    thehand.splice(selectedindex, 1);
    console.log('the hand is now: ', thehand);
    let tucked = thehand[0];
    tosend.playerstate.selected = cardvalue;
    tosend.playerstate.tucked = tucked;
    console.log('Send this to server cardselect listener; ', tosend);
    this.socket.emit('cardselect', tosend );
  }

  beginGame(event) {
    this.socket.emit('gamestart');
  }

  render() {
    return (
      <div className="testgame">
        <div className="chatroom">
          <ul className="messages">
            {this.state.chat_history.map((text) => {return (<li>{text}</li>);})}
          </ul>
          <form onSubmit={this.onChatSubmit}>
            <input
              placeholder="Chat input here"
              onChange={this.onInputChange}
              value={this.state.typed}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
        <button data-value={this.state.playerstate.hand[0]} onClick={this.onCardSelect}>
          {this.state.playerstate.hand[0]}
        </button>
        <button data-value={this.state.playerstate.hand[1]} onClick={this.onCardSelect}>
          {this.state.playerstate.hand[1]}
        </button>
        <button onClick={this.beginGame}>Start Game!</button>
      </div>
    );
  }



}
