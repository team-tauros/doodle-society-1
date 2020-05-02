import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Main.css';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Comments from '../Comments/CommentForm';
import Search from '../Friends/Search';
import Upload from '../Upload';
import Button from 'react-bootstrap/Button'
import TopTen from '../TopTen/TopTen'

const moment = require('moment');
//  main feed
const Home = ({
  user, doods, friends, getFriends, setFriends, likedDoods, getDoods,
}) => {
  //  likes and load will store temporary information for increases and decreases in a doodle's likes
  //  when a user likes/unlikes a doodle, the increase/decrease will immediately be rendered while the
  //  page is in between refreshes of like counts from the server
  const [likes, setLikes] = useState({});
  const [load, setLoad] = useState({});
  const [numDoods, setNumDoods] = useState(5);
  const [message, setMessage] = useState({to: "", body:"", name:""});


  const textMessage = () =>{
      message.to = "+1" + message.to;
      document.getElementById("twilio-form").reset();
      axios.post('/api/messages', message)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  //  toggle appearance of likes heart
  const toggleLike = (e) => {
    (e.currentTarget.className.baseVal === 'clear-heart') ? e.currentTarget.className.baseVal = 'red-heart' : e.currentTarget.className.baseVal = 'clear-heart';
  };
  //  like a doodle
  const addLikedDood = (user_id, doodle_id) => {
    //  set doodle's load status to true
    const updateLoad = {...load};
    updateLoad[doodle_id] = true;
    setLoad(updateLoad);
    //  set doodle's like increase
    const updateLikes = {...likes};
    updateLikes[doodle_id] ? updateLikes[doodle_id]++ : updateLikes[doodle_id] = 1;
    setLikes(updateLikes);
    //  post like to db
    axios.post(`/api/doodles/likes/${user_id}/${doodle_id}`);
  };
  //  unlike a doodle
  const unLikeDood = (user_id, doodle_id) => {
    // set doodle's load status to true
    const updateLoad = {...load};
    updateLoad[doodle_id] = true;
    setLoad(updateLoad);
    //  set doodle's like decrease
    const updateLikes = {...likes};
    updateLikes[doodle_id] ? updateLikes[doodle_id]-- : updateLikes[doodle_id] = -1;
    setLikes(updateLikes);
    axios.patch(`/api/doodles/likes/${user_id}/${doodle_id}`); // delete like from db
  };
  //  whenever a refresh comes in, clear temporary likes data
  useEffect(() => {
    setLoad({});
    setLikes({});
  }, [doods]);

  //  check if a doodle is in user's likes
  const isLiked = (dood) => likedDoods.some((likedDood) => likedDood.id === dood.id);

  //  order all doodles by timestamp
  const orderDoods = () => {
    //  allDoods container for ordered doodles
    const allDoods = [];
    //  push all doodles stored on doods object into allDoods
    Object.values(doods).forEach((doodColl) => {
      doodColl.forEach((dood) => allDoods.push(dood));
    });
    //  sort allDoods by timestamp
    allDoods.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
    return allDoods;
  };
  
  return (
    <div className="Home">
      <div className="header text-left">
        <div className="flex-grid">
          <div className="well">
            <img className="col" src={user.imageurl} alt="" />
            <div className="col">{user.name}</div>
          </div>
          <Upload user={user} />
        </div>
        <div className="col">
          <Search
            user={user}
            friends={friends}
            getFriends={getFriends}
            setFriends={setFriends}
          />
        </div>
        <form id="twilio-form">
      <div>
        <label htmlFor="to">Invite Your Friends</label>
        <input
          type="tel"
          name="to"
          id="to"
          placeholder="(555)-555-5555"
          onChange={(event) => setMessage({to: event.target.value, name: user.name})
          }
        />
      </div>
        <button type="button" className="btn-primary" onClick={()=> textMessage()}>
          Send Invite
        </button>
      </form>
      </div>
      <TopTen doods={doods} getDoods={getDoods} />
      <div className="main">
        {orderDoods().slice(0, numDoods).map((dood) => {
          const doodler = dood.username === user.name ? user
            : friends.filter((friend) => friend.name === dood.username)[0];
          return (
            <div className="feed-doodle-container" key={dood.username + dood.id}>
              <img className="feed-doodle" src={dood.url} alt="" />
              <img className="feed-bg-image" src={dood.original_url} alt="" />
              <p align="justify">
                <Link
                  className="userName"
                  to={{
                    pathname: '/profile',
                    user: doodler,
                  }}
                >
                  {`${dood.username}:`}
                </Link>
                <div className="iconContainer">
                  <FaHeart
                    size="2em"
                    className={isLiked(dood) ? 'red-heart' : 'clear-heart'}
                    onClick={(e) => {
                      toggleLike(e);
                      e.currentTarget.className.baseVal === 'clear-heart'
                        ? unLikeDood(user.id, dood.id)
                        : addLikedDood(user.id, dood.id);
                    }}
                  />
                </div>
                <div className="countContainer">
                  <p>
                    <b>
                      Total Likes:
                      {dood.count + (load[dood.id] && likes[dood.id] || 0)}
                    </b>
                  </p>
                </div>
              </p>
              <p align="justify"><font className="caption">{dood.caption}</font></p>
              <p align="justify"><font className="createdAt">{moment(dood.created_at).startOf('minute').fromNow()}</font></p>
              <p align="justify">
                <font className="originalDoodle">
                  <Link to={{
                    pathname: '/doodle',
                    url: dood.original_url,
                    original_id: dood.original_id,
                  }}
                  >
                    Doodle Original Image
                  </Link>
                </font>
              </p>
              <Comments dood={dood} user={user} />
            </div>
          );
        })}
        <Button variant="primary" onClick={() => setNumDoods(numDoods + 5)}>Show More Doodles </Button>
        <p>
          {numDoods > 5 && <Button variant="danger" onClick={() => setNumDoods(numDoods - 5)}>Show Less Doodles </Button>}
        </p>
      </div>
    </div>

  );
};
export default Home;
