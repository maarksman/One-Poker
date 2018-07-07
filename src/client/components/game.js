import React, {Component } from 'react';
import ChatRoom from './chatroom';

export default class Game extends Component {
  constructor(props) {
    super(props)

    this.state = {is_game: true, game_ongoing: this.props.game_ongoing};
  }

  render() {
    return (
      <ChatRoom game_ongoing={this.state.game_ongoing} />
    );
  }

}
