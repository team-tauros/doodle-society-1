import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import axios from 'axios';
import './imagefeed.css';

const moment = require('moment');


const NormalImageFeed = ({
  imgs, user, doods, getAllDoods, allowDeletePicture, getImgs, setImgs,
}) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [doodIndex, setDoodIndex] = useState(0);

  const deleteDoodle = (id) => {
    setDoodIndex(0);
    return axios.delete(`/api/doodles/${id}`)
      .then(() => {
        getAllDoods();
      });
  };

  const handleSelectDood = (i) => setDoodIndex(i);

  const handleSelectImg = (i) => setImgIndex(i);

  const deleteImage = (id) => {
    setImgIndex(0);
    setDoodIndex(0);
    return axios.delete(`/api/images/${id}`)
      .then(() => getImgs(user))
      .then((imgs) => setImgs(imgs.data));
  };

  const history = useHistory();

  return (
    <div className="profile-feed">
      <div className="normal-img">
        <h3>Uploads</h3>
        <Carousel id="imgs" activeIndex={imgIndex} onSelect={handleSelectImg} interval={null}>
          {imgs.map((img) => (
            <Carousel.Item>
              <div className="profile-img-container" key={img.id}>
                {
            allowDeletePicture
          && (
          <img
            className="gear"
            onClick={() => {
              if (window.confirm('WARNING: Deleting an image will delete all of the doodles associated with it. Are you sure you would like to delete this image?')) {
                deleteImage(img.id);
                // history.push({
                //   pathname: '/profile',
                //   user: user
                // })
              }
            }}
            src="https://www.freeiconspng.com/uploads/trash-can-icon-27.png"
            alt="gear"
          />
          )
          }
                <Link to={{
                  pathname: '/doodle',
                  url: img.url,
                  original_id: img.id,
                }}
                >
                  <img className="gallery-img" src={img.url} alt="" />
                </Link>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      <div className="doodled-img">
        <h3>Doodles</h3>
        <Carousel id="doodles" activeIndex={doodIndex} onSelect={handleSelectDood} interval={null}>
          {doods[user.id] && doods[user.id].map((dood) => (
            <Carousel.Item>
              <div key={dood.id}>
                <div className="doodle-img-container">
                  <p align="justify"><font size="3" color="black">{`#${dood.caption}`}</font></p>
                  {
            allowDeletePicture
          && (
          <img
            className="gear"
            onClick={() => {
              if (window.confirm('Are you sure you would like to delete this doodle?')) {
                deleteDoodle(dood.id);
                history.push({
                  pathname: '/profile',
                  user,
                });
              }
            }}
            src="https://www.freeiconspng.com/uploads/trash-can-icon-27.png"
            alt="gear"
          />
          )
          }
                  <img className="doodle" src={dood.url} alt="" />
                  <img className="bg-img" src={dood.original_url} alt="" />
                  <p align="justify"><font className="createdAt">{moment(dood.created_at).startOf('minute').fromNow()}</font></p>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
};
export default NormalImageFeed;
