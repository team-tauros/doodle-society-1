import React, { useState, useEffect } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import SideNav from './profile-side-nav';
import NormalImageFeed from './imagesfeed';
import Bio from './Bio';


const Profile = ({ user, doods, getImgs, getFriends, requests, allowEditBio, getAllDoods, allowDeletePicture }) => {
  const [imgs, setImgs] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    getImgs(user)
      .then((imgs) => setImgs(imgs.data));
    getFriends(user)
      .then((friends) => setFriends(friends.data));
  }, [getImgs, getFriends, user]);

  return (
    <div>
      <div className="imgheader">
        <Row>
          <Col className="profile-info">
            <div style={{ color: '#FF2372' }}><b>{ user.name }</b></div>
            <Image className="profileimgs" src={user.imageurl} rounded />
            <div style={{ color: '#46E4C1' }}>{ user.email }</div>
            <div style={{ color: '#FFF64F' }}>{ user.id !== null && doods[user.id] ? `Total Doods: ${doods[user.id].length}` : null }</div>
            <Bio user={user} allowEditBio={allowEditBio} />
            <SideNav
              user={user}
              friends={friends}
              requests={requests || null}
              getFriends={getFriends}
              setFriends={setFriends}
            />
          </Col>
          <Col>
            <NormalImageFeed
              imgs={imgs}
              user={user}
              doods={doods}
              getAllDoods={getAllDoods}
              allowDeletePicture={allowDeletePicture}
              getImgs={getImgs}
              setImgs={setImgs}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Profile;
