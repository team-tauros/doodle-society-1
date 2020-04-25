/* eslint-disable max-lines-per-function */
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

    const handleSearch = search => new Promise((resolve) => {
        axios.get(`/api/users/find/${search}`)
        .then(users => resolve(users.data.map((user) => {
            const youAreFriends = friends.some(friend => friend.id === user.id) ? ' (friend)' : '';

            
            return {
                "value": user,
                "label": user.name + youAreFriends
            }
        })));
    })


    const renderRedirect = () => {
        if (redirect) {
            return <Redirect to="/profile" />
        }
        
        return <Redirect to="/home" />
    }

    const addFriend = (friend) => {
        axios.post('/api/friends', { "user_id": user.id,
            "friend_id": friend.id })
      .then((result) => {
          if (result.data === 'exists') {
              alert("You've already sent a friend request to this user.");             
              
              return Promise.reject('Friend request already sent.');
          }
          
          return getFriends(user)
          .then((results) => {
              setFriends(results.data);
          })
          .catch(err => console.error(err))
      })
      .then(() => setRedirect(true))
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
