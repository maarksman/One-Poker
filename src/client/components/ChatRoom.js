const datetime = require('node-datetime');
import React, { Component } from 'react';
import io from 'socket.io-client';


export default class ChatRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {chat_history: ['starter message'], typed: ''};
    this.onChatSubmit = this.onChatSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  ComponentDidMOunt() {
    const testsocket = io.connect('http://localhost:8080');
    testsocket.on('connect', () => {console.log('connected to server');});
  }

  onChatSubmit(event) {
    var newarray = this.state.chat_history.concat(this.state.typed)
    event.preventDefault();
    //alter state to add message history
    //alert('Submitted:' + this.state.typed);
    this.setState({chat_history: newarray})
    this.setState({typed:''});
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
