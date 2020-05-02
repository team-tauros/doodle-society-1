import React, { Component } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import './Chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);
    const firstName = props.user.name;
    const first = firstName.split(' ');
    this.state = {
      text: '',
      username: first[0],
      chats: []
    };
    this.handleTextChange = this.handleTextChange.bind(this);
  }
  
  componentDidMount() {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: 'us2',
    });
    const channel = pusher.subscribe('chat');
    channel.bind('message', data => {
      this.setState({ chats: [...this.state.chats, data], test: '' });
    });
  }

  handleTextChange(e) {
    if (e.keyCode === 13) {
      const payload = {
        username: this.state.username,
        message: this.state.text
      };
      axios.post('http://localhost:4000/message', payload);
    } else {
      this.setState({ text: e.currentTarget.value });
    }
  }

  render() {
    return (
      <div className='chat-home'>
        <section>
          <div className="container-fluid">
          <div className="d-flex flex-column">
            <ChatList chats={this.state.chats} />
            <ChatBox
              text={this.state.text}
              username={this.state.username}
              handleTextChange={this.handleTextChange}
            />
            </div>
          </div>  
        </section>
      </div>
    );
  }
}

export default Chat;
