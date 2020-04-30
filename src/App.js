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
import Chat from './Chat/Chat';
import Map from './Map/Map';
import Live from './Live/Live';


function App() {
  const [user, setUser] = useState({ id: null, name: 'Not logged in' });
  const [doods, setDoods] = useState({});
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [likedDoods, setLikedDoods] = useState([]);
  const [loadingDoods, setLoading] = useState(true);
  const [fetchFriends, setFetch] = useState();
  //  get a user's doodles
  const getDoods = (user) => axios.get(`/api/doodles/${user.id}`);
  //  get a user's images
  const getImgs = (user) => axios.get(`/api/images/${user.id}`);
  //  get a user's liked doodles
  const getLikedDoods = (user) => {
    //  only run if a user is logged in
    if (!user.id) {
      return;
    }
    //  get user's likes, then set the likedDoods state  
    axios.get(`/api/doodles/likes/${user.id}`)
      .then((likedDoods) => {
        setLikedDoods(likedDoods.data);
      })}
  //  get all doodles from user and user's friends
  const getAllDoods = () => {
    //  only run if a user is logged in
    if (!user.id) {
      return;
    }
    //  allUsers will hold user plus all user's friends
    const allUsers = [user].concat(friends);
    //  get doodles for each user
    return Promise.all(allUsers.map((user) => getDoods(user)))
      .then((allDoods) => {
        const newDoods = {};
        allDoods  //  store arrays of doodles on newDoods object, with user id for key
          .map((userDoods) => userDoods.data)
          .forEach((userDoods) => {
            if (userDoods.length) {
              newDoods[userDoods[0].doodler_id] = userDoods;
            }
          });
        setDoods(newDoods); //  set doods state to newDoods
        setLoading(false);  //  set loadingDoods to false now that doodles are loaded
      })
      .catch((err) => console.error(err));
  };
  //  get a user's friends
  const getFriends = (user) => axios.get(`/api/friends/${user.id}`);
  //  get any friend requests sent to current user
  const getRequests = () => {
    //  only run if a user is logged in
    if (!user.id) {
      return;
    }
    //  get the requests, then filter out any confirmed requests
    axios.get(`/api/friends/requests/${user.id}`)
      .then((requests) => setRequests(requests.data
        .filter((request) => !friends
          .some((friend) => friend.id === request.id))))
      .catch((err) => console.error(err));
  };
  //  whenever friends state is updated, refresh doodles, requests, and likes
  useEffect(() => {
    getAllDoods();
    getRequests();
    getLikedDoods(user);
  }, [friends]);
  //  whenever a new user logs into app, get their friends and schedule a 5 second interval to refresh friends
  useEffect(() => {
    //  clear any previously existing scheduled friends fetcher
    if (fetchFriends) {
      clearInterval(fetchFriends);
    }
    if (user.id) {
      getFriends(user)
        .then((results) => setFriends(results.data))
        .catch((err) => console.error(err));

      setFetch(setInterval(() => {
        getFriends(user)
          .then((results) => setFriends(results.data))
          .catch((err) => console.error(err));
      }, 5000));
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
                return loadingDoods ? (
                  <div>
                    <img src={process.env.PUBLIC_URL + '/spinner.gif'} />
                    <p>
                      ...loading doods...
                    </p>
                  </div>
                )
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
            <Route
              path="/chat"
              render={(props) => {
                if (!user.id) {
                  return (
                    <Redirect to={{
                      pathname: '/',
                      back: '/chat',
                    }}
                    />
                  );
                }
                const chatUser = props.location.user || user;
                return (
                  <Chat
                  user={chatUser}
                  />
                );
              }}
            />
            <Route
              path="/map"
              render={() => {
                if (!user.id) {
                  return (
                    <Redirect to={{
                      pathname: '/',
                      back: '/map',
                    }}
                    />
                  );
                }
                return (
                  <Map
                  doods={doods}
                  />
                );
              }}
            />
            <Route
              path="/live"
              render={() => {
                if (!user.id) {
                  return (
                    <Redirect to={{
                      pathname: '/',
                      back: '/live',
                    }}
                    />
                  );
                }
                return (
                  <Live
                  // import stuff here
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
