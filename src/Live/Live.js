import React, { Component } from 'react';
import { v4 } from 'uuid';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Carousel } from 'react-bootstrap';
import { store } from 'react-notifications-component';
import Button from 'react-bootstrap/Button';

class Live extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      image: 'https://i.pinimg.com/originals/f5/05/24/f50524ee5f161f437400aaf215c9e12f.jpg',
      count: 0,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    this.pusher = new Pusher('4d4166c393ed3879b662', {
      cluster: 'us2',
    });
    this.getAllImages = this.getAllImages.bind(this);
    this.setCanvas = this.setCanvas.bind(this);
    this.nextImage = this.nextImage.bind(this);
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

  getAllImages() {
    axios.get('/api/images')
      .then((res) => {
        this.setState({
          images: res.data,
        })
        console.log(this.state.images)
      })
      .catch((err) => console.error(err));
  };

  nextImage() {
    let i = this.state.count;
    i++;
    if (this.state.images[i]){
      this.setState({
        image: this.state.images[i].url,
        count: i,
      })
    } else {
      this.setState({
        image: this.state.images[0].url,
        count: 0,
      })
    }
  }

  setCanvas() {
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

  render() {
    const { images, image } = this.state;
    // console.log('this is', images);
    return (
      <div>
        <div>
          <h1>Live Doods</h1>
          <canvas
          // We use the ref attribute to get direct access to the canvas element. 
          ref={(ref) => (this.canvas = ref)}
          style={{  
            backgroundImage: `url('${image}')`,
            // backgroundImage: `url('https://i.pinimg.com/originals/f5/05/24/f50524ee5f161f437400aaf215c9e12f.jpg')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
          onMouseDown={this.onMouseDown}
          onMouseLeave={this.endPaintEvent}
          onMouseUp={this.endPaintEvent}
          onMouseMove={this.onMouseMove}
          className="canvas2"
          id="canvas2" 
          />
          {/* {images.map((image) => {
            this.setCanvas();
            return (
              <canvas
              // We use the ref attribute to get direct access to the canvas element. 
              ref={(ref) => (this.canvas = ref)}
              style={{  
                backgroundImage: `url('${image.url}')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'
              }}
              onMouseDown={this.onMouseDown}
              onMouseLeave={this.endPaintEvent}
              onMouseUp={this.endPaintEvent}
              onMouseMove={this.onMouseMove}
              />
              )
            })} */}
          </div>
        <Button onClick={this.nextImage}>New Image</Button> 
      </div>
    );
  }
}
export default Live;