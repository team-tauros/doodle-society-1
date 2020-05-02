import React, { Component, useEffect } from 'react';
import { v4 } from 'uuid';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Carousel } from 'react-bootstrap';
import { store } from 'react-notifications-component';
import Button from 'react-bootstrap/Button';
import Chat from '../Chat/Chat';

class Live extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      image: '',
      count: 0,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    this.pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: 'us2',
    });
    this.getAllImages = this.getAllImages.bind(this);
    this.nextImage = this.nextImage.bind(this);
    this.getLiveImage = this.getLiveImage.bind(this);
    this.clear = this.clear.bind(this);
  }

  isPainting = false;
  // Different stroke styles to be used for user and guest
  userStrokeStyle = '#EE92C2';
  guestStrokeStyle = '#F0C987';
  line = [];
  // v4 creates a unique id for each user. We used this since there's no auth to tell users apart
  userId = v4();
  prevPos = { offsetX: 0, offsetY: 0 };

  onMouseDown({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    this.isPainting = true;
    this.prevPos = { offsetX, offsetY };
  }

  onMouseMove({ nativeEvent }) {
    if (this.isPainting) {
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      // Set the start and stop position of the paint event.
      const positionData = {
        start: { ...this.prevPos },
        stop: { ...offSetData },
      };
      // Add the position to the line array
      this.line = this.line.concat(positionData);
      this.paint(this.prevPos, offSetData, this.userStrokeStyle);
    }
  }
  
  endPaintEvent() {
    if (this.isPainting) {
      this.isPainting = false;
      this.sendPaintData();
    }
  }

  paint(prevPos, currPos, strokeStyle) {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    // Move the the prevPosition of the mouse
    this.ctx.moveTo(x, y);
    // Draw a line to the current position of the mouse
    this.ctx.lineTo(offsetX, offsetY);
    // Visualize the line using the strokeStyle
    this.ctx.stroke();
    this.prevPos = { offsetX, offsetY };
  }

  async sendPaintData() {
    const body = {
      line: this.line,
      userId: this.userId,
    };
    // We use the native fetch API to make requests to the server
    const req = await fetch('http://localhost:4000/live', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });
    // eslint-disable-next-line no-unused-vars
    const res = await req.json();
    this.line = [];
  }

  componentDidMount() {
    this.getAllImages();
    this.getLiveImage();
    // Here we set up the properties of the canvas element. 
    this.canvas.width = 1000;
    this.canvas.height = 800;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 5;
    const channel = this.pusher.subscribe('painting');
    channel.bind('draw', (data) => {
      const { userId, line } = data;
      if (userId !== this.userId) {
        line.forEach((position) => {
          this.paint(position.start, position.stop, this.guestStrokeStyle);
        });
      }
    });
  }

  intervalID;
  componentWillUnmount() {
    clearTimeout(this.intervalID);
  }

  // get all images uploaded to database
  getAllImages() {
    axios.get('/api/images')
      .then((res) => {
        console.log(res.data);
        this.setState({
          images: res.data
        })
      })
      .catch((err) => console.error(err));
  };

  // get current live image - this will run every 5 seconds to update image
  getLiveImage() {
    axios.get('/api/live')
      .then((res) => {
        this.setState({
          image: res.data[0].url,
          count: res.data[0].original_id
        })
        this.intervalID = setTimeout(this.getLiveImage.bind(this), 5000);
      })
      .catch((err) => console.error(err));
  }

  // cycle through images and updates live image for all users (could look better but works)
  nextImage() {
    let { images, count } = this.state;
    let i = count;
    i++;
    if (i < images.length){
      const { url, id } = images[i];
      this.setState({
        image: url,
        count: i,
      })
      axios.post('/api/live', { url: url, original_id: id });
    } else {
      const { url, id } = images[0];
      this.setState({
        image: images[0].url,
        count: 0,
      })
      axios.post('/api/live', { url: url, original_id: id });
    }
  }

  // clear canvas for user
  clear() {
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    const { image } = this.state;
    return (
      <div className="container-fluid live-room">
          <h1>Doodle with Friends</h1>
        <div className="row d-flex flex-row">
          <div className="col-4 message-view">
          <Chat user={this.props.user}></Chat>
          </div>
          <div className="col-8 canvas-view">
          <canvas
          // We use the ref attribute to get direct access to the canvas element. 
          ref={(ref) => (this.canvas = ref)}
          style={{  
            backgroundImage: `url('${image}')`,
            backgroundSize: '1000px 800px',
            backgroundRepeat: 'no-repeat'
          }}
          onMouseDown={this.onMouseDown}
          onMouseLeave={this.endPaintEvent}
          onMouseUp={this.endPaintEvent}
          onMouseMove={this.onMouseMove}
          className="canvas2"
          id="canvas2" 
          />
          </div>
          </div>
        <Button onClick={this.nextImage}>New Image</Button> 
        <Button onClick={this.clear}>Clear</Button>
      </div>
    );
  }
}
export default Live;