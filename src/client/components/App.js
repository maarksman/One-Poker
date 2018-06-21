import React, { Component } from 'react';
import './../styles/app.css';
import io from 'socket.io-client';

const testsocket = io.connect('http://localhost:8080');

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { username: null };
  }


  render() {
    return (
      <div>
        {this.state.username ? (
          <h1>Hello {this.state.username}</h1>
        ) : (
          <h1>Loading.. please wait!</h1>
        )}
      </div>
    );
  }
}
