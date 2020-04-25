import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import ReactNotifications from 'react-notifications-component';
import axios from 'axios';
import './App.css';
import Login from './Login/log-in';
import Upload from './Upload';
import Canvas from './Canvas';
import NavigationBar from './Nav/nav';
import Main from './Main/Main';
import Search from './Friends/Search';
import Profile from './Proflie/profile';


function App() {
  const [user, setUser] = useState({ id: null, name: 'Not logged in' });
  const [doods, setDoods] = useState({});
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [likedDoods, setLikedDoods] = useState([]);
  const [loadingDoods, setLoading] = useState(true);

  const getDoods = (user) => axios.get(`/api/doodles/${user.id}`);

  const getImgs = (user) => axios.get(`/api/images/${user.id}`);

  const getLikedDoods = (user) => axios.get(`/api/doodles/likes/${user.id}`)
    .then((likedDoods) => {
      setLikedDoods(likedDoods.data);
    });

  const getAllDoods = () => {
    if (!user.id) {
      return;
    }
    const allUsers = [user].concat(friends);
    return Promise.all(allUsers.map((user) => getDoods(user)))
      .then((allDoods) => {
        const newDoods = {};
        allDoods
          .map((userDoods) => userDoods.data)
          .forEach((userDoods) => {
            if (userDoods.length) {
              newDoods[userDoods[0].doodler_id] = userDoods;
            }
          });
        setDoods(newDoods);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  const getFriends = (user) => axios.get(`/api/friends/${user.id}`);

  const getRequests = () => {
    if (!user.id) {
      return;
    }
    axios.get(`/api/friends/requests/${user.id}`)
      .then((requests) => setRequests(requests.data
        .filter((request) => !friends
          .some((friend) => friend.id === request.id))))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    getAllDoods();
    getRequests();
    getLikedDoods(user);
  }, [friends]);

  useEffect(() => {
    if (user.id) {
      getFriends(user)
        .then((results) => setFriends(results.data))
        .catch((err) => console.error(err));

      setInterval(() => {
        getFriends(user)
          .then((results) => setFriends(results.data))
          .catch((err) => console.error(err));
      }, 5000);
    }
  }, [user]);

  return (
    <div className="App">
      <React.Fragment>
        <Router>
          <ReactNotifications />
          <NavigationBar
            user={user}
            setUser={setUser}
            getAllDoods={getAllDoods}
          />
          <Switch>
            <Route
              exact path="/"
              render={(props) => {
                const { back } = props.location;
                if (!user.id) {
                  return <Login setUser={setUser} />;
                }
                if (!back) {
                  return <Redirect to="/home" />;
                }
                return <Redirect to={back} />;
              }}
            />
            <Route
              path="/upload"
              render={() => {
                if (!user.id) {
                  return (
                    <Redirect
                      to={{
                        pathname: '/',
                        back: '/upload',
                      }}
                    />
                  );
                }
                return <Upload user={user} setUser={setUser} />;
              }}
            />
            <Route
              path="/profile"
              render={(props) => {
                if (!user.id) {
                  return (
                    <Redirect to={{
                      pathname: '/',
                      back: '/profile',
                    }}
                    />
                  );
                }
                const profUser = props.location.user || user;
                const allowEditBio = profUser.id === user.id;
                const allowDeletePicture = profUser.id === user.id;
                if (!friends.some((friend) => friend.id === profUser.id) && profUser.id !== user.id) {
                  alert(`You are not yet friends with ${profUser.name}. Please add them first.`);
                  return <Redirect to="/home" />;
                }
                return (
                  <Profile
                    user={profUser}
                    doods={doods}
                    getAllDoods={getAllDoods}
                    getImgs={getImgs}
                    getFriends={getFriends}
                    requests={profUser.id === user.id && requests}
                    allowEditBio={allowEditBio}
                    allowDeletePicture={allowDeletePicture}
                  />
                );
              }}
            />
            <Route
              path="/doodle"
              render={(props) => {
                if (!user.id) {
                  return (
                    <Redirect to={{
                      pathname: '/',
                      back: '/doodle',
                    }}
                    />
                  );
                }
                return (
                  <Canvas
                    user={user}
                    url={props.location.url}
                    original_id={props.location.original_id}
                    getAllDoods={getAllDoods}
                  />
                );
              }}
            />
            <Route
              path="/home"
              render={() => {
                if (!user.id) {
                  return (
                    <Redirect to={{
                      pathname: '/',
                      back: '/home',
                    }}
                    />
                  );
                }
                return loadingDoods ? <div>...loading doods...</div>
                  : (
                    <Main
                      user={user}
                      doods={doods}
                      friends={friends}
                      getFriends={getFriends}
                      setFriends={setFriends}
                      likedDoods={likedDoods}
                      getAllDoods={getAllDoods}
                    />
                  );
              }}
            />
            <Route
              path="/search"
              render={() => {
                if (!user.id) {
                  return (
                    <Redirect to={{
                      pathname: '/',
                      back: '/search',
                    }}
                    />
                  );
                }
                return (
                  <Search
                    user={user}
                    getFriends={getFriends}
                  />
                );
              }}
            />
          </Switch>
        </Router>
      </React.Fragment>
    </div>
  );
}

export default App;
