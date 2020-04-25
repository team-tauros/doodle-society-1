/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';
import { ListItem, ListItemText, List } from '@material-ui/core';
import axios from 'axios';

const SideNav = ({
  user, friends, setFriends, getFriends, requests,
}) => {
  const addFriend = (friend) => {
    axios.post('/api/friends', { user_id: user.id, friend_id: friend.id })
      .then(() => {
        getFriends(user)
          .then((results) => setFriends(results.data))
          .catch((err) => console.error(err));
      });
  };

  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <List disablePadding dense>
      <ListItem button>
        <ListItemText style={{ color: '#FFF64F' }}><b>Friends</b></ListItemText>
        {friends.map((friend) => (
          <ListItemText key={friend.id}>
            <Link
              className="userName"
              to={{
                pathname: '/profile',
                user: friend,
              }}
            >
              {friend.name}
            </Link>
          </ListItemText>
        ))}
      </ListItem>
      <ListItem button>
        {!!requests && !!requests.length && <ListItemText style={{ color: '#FFAA1D' }}>Friend Requests:</ListItemText>}
        {!!requests
            && requests.map((request) => (
              <ListItemText style={{ color: '#FFAA1D' }} key={request.id} onClick={() => addFriend(request)}>
                {request.name}
              </ListItemText>
            ))}
      </ListItem>
    </List>
  );
};

export default SideNav;
