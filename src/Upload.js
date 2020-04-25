import React from 'react';
import { useHistory } from 'react-router-dom';
import { CloudinaryContext } from 'cloudinary-react';
import axios from 'axios';
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import Button from 'react-bootstrap/Button';
import { openUploadWidget } from './CloudinaryService';

// function for handling upload widget for cloudinary
function Upload({ user }) {
  const history = useHistory();
  const options = {
    title: 'SUCCESS!',
    message: 'Photo successfully uploaded!',
    type: 'success',
    container: 'center',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    dismiss: {
      duration: 1500,
    },
  };

  const beginUpload = (tag) => {
    const uploadOptions = {
      cloudName: 'dmxywbm74',
      tags: [tag, 'anImage'],
      uploadPreset: 'wkyeuokl',
      cropping: 'true',
      croppingAspectRatio: 1,
      croppingCoordinatesMode: 'custom',
    };
    openUploadWidget(uploadOptions, (error, photos) => {
      if (!error) {
        Promise.all(photos.map((photo) => axios.post('/api/images', { url: photo.url, uploader_id: user.id })))
          .then(() => {
            setTimeout(() => store.addNotification(options), 0);
            history.push('/profile');
          })
          .catch((err) => console.error(err));
      } else {
        console.log(error);
      }
    });
  };

  return (
    <div className="Upload">
      <div className="Upload-header">
        <CloudinaryContext cloudName="dmxywbm74">
          <Button
            variant="primary"
            onClick={() => beginUpload('image')}
          >
            Upload Image
          </Button>
          {' '}
        </CloudinaryContext>
      </div>
    </div>
  );
}

export default Upload;
