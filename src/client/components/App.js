import React, { Component } from 'react';
import './../styles/app.css';
import Game from './game';
//const io = require('socket.io-client');


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { username: null, game_ongoing: false, in_lobby: false};

    this.gameSwitch = this.gameSwitch.bind(this);
    this.lobbySwitch = this.lobbySwitch.bind(this);

  }

  //after mounting, uses diff socket emits to join lobby and game onChatSubmit
  //lobby and game chats are separate components


  lobbySwitch(event) {
    event.preventDefault();
    //alert("Gameswitch pressed!");
    let newstate = !(this.state.in_lobby);
    console.log('lobby on/off changing from ', this.state.in_lobby, 'to: ', newstate);
    this.setState({in_lobby: newstate});
  }

  gameSwitch(event) {
    event.preventDefault();
    //alert("Gameswitch pressed!");
    let newstate = !(this.state.game_ongoing);
    console.log('lobby on/off changing from ', this.state.game_ongoing, 'to: ', newstate);
    this.setState({game_ongoing: newstate});
  }


  render() {
    if (this.state.in_lobby) {
      return (
        <div>
          <p>In Lobby!</p>
          <Game game_ongoing={this.state.game_ongoing} />
          <button onClick={this.lobbySwitch}>
               Leave Lobby
          </button>
        </div>
      );
    }
    return (
      <div>
        {this.state.username ? (
          <h1>Hello {this.state.username}</h1>
        ) : (
          <h1>Loading.. please wait!</h1>
        )}
        <button onClick={this.lobbySwitch}>
            Join Lobby
        </button>
      </div>
    );
  }
}
