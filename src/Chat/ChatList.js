import React from "react";
import "./ChatList.css";

export default ({ chats }) => (
  <ul>
    {chats.map(chat => {
      return (
          <div className="row show-grid">
              <div className="chatMessage">
                <div key={chat.id} className="box">
                    <strong>{chat.username}</strong>: {chat.message}
                </div>
              </div>
            </div>
      );
    })}
  </ul>
);