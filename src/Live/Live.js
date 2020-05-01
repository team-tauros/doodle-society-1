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
      image: '',
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
    // this.save = this.save.bind(this);
    this.getLiveImage = this.getLiveImage.bind(this);
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

  getLiveImage() {
    axios.get('/api/live')
      .then((res) => {
        console.log(res.data);
        this.setState({
          image: res.data[0].url,
          count: res.data[0].id
        })
      })
      .catch((err) => console.error(err));
  }

  nextImage() {
    let { images, count } = this.state;
    let i = count;
    i++;
    if (images[i]){
      const url = images[i].url;
      axios.post('/api/live', { url });
      this.setState({
        image: images[i].url,
        count: i,
      })
    } else {
      const url = images[0].url;
      axios.post('/api/live', { url });
      this.setState({
        image: images[0].url,
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

  // save() {
  //   const {
  //     user, getAllDoods,
  //   } = this.props;
  //   const options = {
  //     title: 'SUCCESS!',
  //     message: 'Doods saved!',
  //     type: 'success', // 'default', 'success', 'info', 'warning'
  //     container: 'center', // where to position the notifications
  //     animationIn: ['animated', 'fadeIn'], // animate.css classes that's applied
  //     animationOut: ['animated', 'fadeOut'], // animate.css classes that's applied
  //     dismiss: {
  //       duration: 1500,
  //     },
  //   };
  //   //  get data url for doodle from canvas
  //   const dataUrl = document.getElementById('canvas2').toDataURL();
  //   //  get entered caption
  //   //  post doodle info to server
  //   axios.post('/api/doodles', {
  //     url: dataUrl, caption: 'live doodle', original_id: 99999, doodler_id: user.id, lat: 29.972065, lng: -90.111533,
  //   })
  //     .then(() => {
  //       getAllDoods();  //  refresh doodles
  //       setTimeout(() => { store.addNotification(options); }, 0); //  notify user of successful save
  //     })
  //     .catch((err) => console.error(err));
  // };

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
        {/* <Button variant="success" onClick={this.save} >Save</Button> */}
      </div>
    );
  }
}
export default Live;