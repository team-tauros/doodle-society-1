import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './App.css';
import { fabric } from 'fabric';
import axios from 'axios';
import { store } from 'react-notifications-component';
import Button from 'react-bootstrap/Button';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import 'fabric-history';
import SmallMap from './Map/SmallMap';

//  declare global canvas variable
let canvas;

function Canvas(props) {
  const {
    url, original_id, user, getAllDoods,
  } = props;
  const [brushColor, setBrushColor] = useState('blue');
  const [saving, setSaving] = useState(false);
  const [coords, setCoords] = useState({ lat: 29.971065, lng: -90.101533 });
  
  useEffect(() => {
    canvas = new fabric.Canvas('canvas', {
      isDrawingMode: true,
      selection: true,
      hoverCursor: 'pointer',
      height: 375,
      width: 375,
    });
    //  make sure new strokes on canvas are not selectable
    canvas.on('mouse:up', () => { canvas.item(canvas._objects.length - 1).selectable = false; });
    canvas.freeDrawingBrush.width = 25;
    canvas.freeDrawingBrush.color = 'blue';
    //  set background of canvas container to received image url
    document.getElementById('canvas-container').style.backgroundImage = `url(${url})`;

  }, [url]);

  const options = {
    title: 'SUCCESS!',
    message: 'Doods saved!',
    type: 'success', // 'default', 'success', 'info', 'warning'
    container: 'center', // where to position the notifications
    animationIn: ['animated', 'fadeIn'], // animate.css classes that's applied
    animationOut: ['animated', 'fadeOut'], // animate.css classes that's applied
    dismiss: {
      duration: 1500,
    },
  };

  const history = useHistory();
  //  handle changes to brush options
  const handleChange = (event) => {
    let { value } = event.target;
    //  if received option value is a number in string form, convert it to a number
    if (!isNaN(Number(value))) {
      value = Number(value);
    }
    //  set new freeDrawingBrush option
    canvas.freeDrawingBrush[event.target.name] = value;
    //  if a new color was set, set brush button color
    if (event.target.name === 'color') {
      setBrushColor(value);
    }
  };
  //  clear canvas
  const clearCanvas = () => {
    canvas.clear();
  };
  //  undo
  const undo = () => {
    canvas.undo();
  };
  //  redo
  const redo = () => {
    canvas.redo();
  };
  //  save a doodle
  const save = () => {
    const { lat, lng } = coords;
    //  set saving state to true while doodle is saving
    setSaving(true);
    //  get data url for doodle from canvas
    const dataUrl = document.getElementById('canvas').toDataURL();
    //  get entered caption
    const caption = document.getElementById('caption').value;
    //  post doodle info to server
    axios.post('/api/doodles', {
      url: dataUrl, caption, original_id, doodler_id: user.id, lat, lng,
    })
      .then(() => {
        getAllDoods();  //  refresh doodles
        setTimeout(() => { store.addNotification(options); }, 0); //  notify user of successful save
        history.push('/profile'); //  redirect to profile
      })
      .catch((err) => console.error(err));
  };
  //  switch to stamp mode
  const useStamp = (event) => {
    //  clear previous mouse down event listeners
    canvas.__eventListeners['mouse:down'] = [];
    //  stop drawing mode
    canvas.isDrawingMode = false;
    //  get stamp image source from clicked button
    const { src } = event.target;
    //  add mouse down event listener to add stamp image at mouse position
    canvas.on('mouse:down', (e) => {
      fabric.Image.fromURL(src, (img) => {
        const posImg = img.set({ left: e.absolutePointer.x - 24, top: e.absolutePointer.y - 24 });
        canvas.add(posImg);
      });
    });
  };
  // enable drawing mode and remove mouse down event listener (to stop stamping)
  const freeDraw = () => {
    canvas.isDrawingMode = true;
    canvas.__eventListeners['mouse:down'] = [];
  };

  return (
    <div className="Doodle">
      <h2>Doodle Page</h2>
      <div className="Doodle-header">
        <div className="Doodle-tools">
          <Button style={{ borderColor: brushColor, backgroundColor: brushColor }} onClick={freeDraw}>
            <img alt="" src={`${process.env.PUBLIC_URL}/icons8-paint-brush-48.png`} style={{ height: 24, width: 24 }} />
          </Button>
          <input type="color" name="color" defaultValue="#0000FF" onChange={handleChange} onClick={freeDraw} />
          <input type="range" name="width" min="5" max="50" defaultValue="25" onChange={handleChange} onClick={freeDraw} />
          <div className="stamps">
            <Button variant="success" src="/icons8-birthday-clown-48.png" onClick={useStamp}>
              <img alt="" src={`${process.env.PUBLIC_URL}/icons8-birthday-clown-48.png`} style={{ height: 24, width: 24 }} />
            </Button>
            <Button variant="success" src="/icons8-skull-48.png" onClick={useStamp}>
              <img alt="" src={`${process.env.PUBLIC_URL}/icons8-skull-48.png`} style={{ height: 24, width: 24 }} />
            </Button>
            <Button variant="success" src="/icons8-moon-and-stars-48.png" onClick={useStamp}>
              <img alt="" src={`${process.env.PUBLIC_URL}/icons8-moon-and-stars-48.png`} style={{ height: 24, width: 24 }} />
            </Button>
            <Button variant="success" src="/icons8-prawn-48.png" onClick={useStamp}>
              <img alt="" src={`${process.env.PUBLIC_URL}/icons8-prawn-48.png`} style={{ height: 24, width: 24 }} />
            </Button>
          </div>
        </div>
        <div className="canvasButtons">
          <Button variant="danger" onClick={clearCanvas}>Clear</Button>
          <Button variant="primary" onClick={undo}>Undo</Button>
          <Button variant="warning" onClick={redo}>Redo</Button>
        </div>

        {/* <div className="Doodle-caption"> removing class from caption */}
        <div style={{"margin-bottom": "20px"}}>
          <h5 style={{
            "backgroundColor": "purple",
            "color": "white",
            "marginTop": "30px",
            "marginBottom": "0px",
            "border": "solid white 1px",
            "borderRadius": "10px",
            }}>Where is your doodle from?</h5>
          <SmallMap coords={coords} setCoords={setCoords} />

          <input id="caption" type="text" placeholder="Caption your doodle!"/>
          {saving &&
            <img src={process.env.PUBLIC_URL + '/spinner.gif'} className="spinner" /> ||
            <Button variant="success" onClick={save} >Save</Button>
          }
        </div>
      </div>
      <div className="canvas-container" id="canvas-container">
        <canvas className="canvas" id="canvas" />
      </div>
    </div>
  );
}

export default Canvas;
