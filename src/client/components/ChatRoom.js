const datetime = require('node-datetime');
import React, { Component } from 'react';
//import io from 'socket.io-client';
const io = require('socket.io-client');
const socket = io('http://localhost:8080');


export default class ChatRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {chat_history: [], typed: '', chat_id: undefined};
    this.onChatSubmit = this.onChatSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);

    this.socket = socket;
  }

  componentDidMount() {
    //const testsocket = socket.connect('http://localhost:8080');
    this.socket.on('connect', () => {
      console.log('this.socket is: ', this.socket)
      console.log('connected to server with id:', this.socket.id);
      this.setState({chat_id: this.socket.id});

      //handle receiving messages
      this.socket.on('receivemessage', (text) => {
        this.setState({chat_history: this.state.chat_history.concat(text)});
      });

      this.socket.on('disconnect', () => {
        console.log('Socket has disconnected');
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

  render() {
    var divstyle = {border: '3px', color:'black'};

    return (
      <div className="chatroom">
        <ul className="messages" style={divstyle}>
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
    );
  }



}
