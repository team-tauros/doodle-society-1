/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Main.css';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Comments from '../Comments/CommentForm';
import Search from '../Friends/Search';
import Upload from '../Upload';

const moment = require('moment');


const Home = ({
  user, doods, friends, getFriends, setFriends, likedDoods,
}) => {
  const [likes, setLikes] = useState({});
  const [load, setLoad] = useState({});


  const toggleLike = (e) => {
    (e.currentTarget.className.baseVal === 'clear-heart') ? e.currentTarget.className.baseVal = 'red-heart' : e.currentTarget.className.baseVal = 'clear-heart';
  };

  // eslint-disable-next-line camelcase
  const addLikedDood = (user_id, doodle_id) => {
    const updateLoad = {...load};
    updateLoad[doodle_id] = true;
    setLoad(updateLoad);
    const updateLikes = {...likes};
    updateLikes[doodle_id] ? updateLikes[doodle_id]++ : updateLikes[doodle_id] = 1;
    setLikes(updateLikes);
    axios.post(`/api/doodles/likes/${user_id}/${doodle_id}`);
  };
  const unLikeDood = (user_id, doodle_id) => {
    const updateLoad = {...load};
    updateLoad[doodle_id] = true;
    setLoad(updateLoad);
    const updateLikes = {...likes};
    updateLikes[doodle_id] ? updateLikes[doodle_id]-- : updateLikes[doodle_id] = -1;
    setLikes(updateLikes);
    axios.patch(`/api/doodles/likes/${user_id}/${doodle_id}`);
  };

  useEffect(() => {
    setLoad({});
    setLikes({});
  }, [doods]);

  const isLiked = (dood) => likedDoods.some((likedDood) => likedDood.id === dood.id);


  const orderDoods = () => {
    const allDoods = [];
    Object.values(doods).forEach((doodColl) => {
      doodColl.forEach((dood) => allDoods.push(dood));
    });
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
      </div>
      <div className="main">
        {orderDoods().map((dood) => {
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
      </div>
    </div>

  );
};
export default Home;
