import React, { useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import _ from 'lodash';
import Button from 'react-bootstrap/Button';

const Search = ({ user, friends, getFriends, setFriends }) => {

    const [select, setSelect] = useState('');
    const [redirect, setRedirect] = useState(false);
    const history = useHistory();

    const handleSearch = (search) => new Promise((resolve) => {
        axios.get(`/api/users/find/${search}`) // execute a search for a user
        .then(users => resolve(users.data.map((user) => {
            //  check if the result is a friend, and tack on (friend) to label if so
            const youAreFriends = friends.some(friend => friend.id === user.id) ? ' (friend)' : '';
            return {
                "value": user,
                "label": user.name + youAreFriends
            }
        })));
    })

    //  redirect to profile is redirect is true
    const renderRedirect = () => {
        if (redirect) {
            return <Redirect to="/profile" />
        }
        
        return <Redirect to="/home" />
    }
    //  send a friend request
    const addFriend = (friend) => {
        axios.post('/api/friends', { "user_id": user.id,
            "friend_id": friend.id })
      .then((result) => {
          //  if friend request was already sent, notify the user  
          if (result.data === 'exists') {
              alert("You've already sent a friend request to this user.");             
              
              return Promise.reject('Friend request already sent.');
          }
          //  otherwise refresh friends
          return getFriends(user)
            .then((results) => {
              setFriends(results.data);
            })
            .catch(err => console.error(err))
      })
      .then(() => setRedirect(true)) // redirect to profile
      .catch(err => console.error(err));
    }

    return (
        <div className="friendSearch">
            {renderRedirect()}
            <i class="fa fa-search icon" aria-hidden="true"></i>
            <AsyncSelect className="react-select-container" classNamePrefix="react-select" loadOptions={handleSearch} onChange={e => setSelect(e.value)} placeholder="Find Friends"/>
        {Boolean(select) &&
        !friends.some(friend => friend.id === select.id) &&
        select.id !== user.id &&
        <Button variant="info" onClick={() => addFriend(select)}>Add</Button>}
      {Boolean(select) &&
        (friends.some(friend => friend.id === select.id) || select.id === user.id) && 
        <Button variant="info" onClick={() => history.push({
            "pathname": '/profile',
            "user": select
        })}>Visit</Button>}
      </div>
    )
}


export default Search;
