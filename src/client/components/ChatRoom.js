import React, { Component } from 'react';

export default class ChatRoom extends Component {
  constructor(props) {
    super(props)

    this.state = {chat_history: []};

  }

  render() {
    <form>
      <input
        placeholder="Chat input here"
      />
      <button type="submit">Submit</button>
    <form>
  }
}
