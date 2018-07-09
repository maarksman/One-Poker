const datetime = require('node-datetime');
import React, { Component } from 'react';
//import io from 'socket.io-client';
const io = require('socket.io-client');


export default class ChatRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {chat_history: [], typed: '', chat_id: undefined, cards:['No value', 'No value']};
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

      this.socket.on('dealcards', (cardlist) => {
        console.log('Got playerstate of: ', cardlist);
        this.setState({cards: cardlist[this.state.chat_id]});
        console.log('this.state.cards is now: ', this.state.cards);
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
    let cardvalue = event.target.getAttribute('data-value');
    console.log('card is', cardvalue );
    this.socket.emit('cardselect', {senderid: this.socket.id, card: cardvalue} );
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
        <button data-value={this.state.cards[0]} onClick={this.onCardSelect}>
          {this.state.cards[0]}
        </button>
        <button data-value={this.state.cards[1]} onClick={this.onCardSelect}>
          {this.state.cards[1]}
        </button>
        <button onClick={this.beginGame}>Start Game!</button>
      </div>
    );
  }



}
