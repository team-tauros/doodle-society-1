/* eslint-disable max-len */
/* eslint-disable react/prop-types */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-filename-extension */
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

let canvas;

function Canvas(props) {
  const {
    // eslint-disable-next-line camelcase
    url, original_id, user, getAllDoods,
  } = props;
  const [brushColor, setBrushColor] = useState('blue');
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    canvas = new fabric.Canvas('canvas', {
      isDrawingMode: true,
      selection: true,
      hoverCursor: 'pointer',
      height: 375,
      width: 375,
    });
    canvas.on('mouse:up', () => { canvas.item(canvas._objects.length - 1).selectable = false; });
    canvas.freeDrawingBrush.width = 25;
    canvas.freeDrawingBrush.color = 'blue';
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
  const handleChange = (event) => {
    let { value } = event.target;
    if (!isNaN(Number(value))) {
      value = Number(value);
    }
    canvas.freeDrawingBrush[event.target.name] = value;
    if (event.target.name === 'color') {
      setBrushColor(value);
    }
  };

  const clearCanvas = () => {
    canvas.clear();
  };

  const undo = () => {
    canvas.undo();
  };

  const redo = () => {
    canvas.redo();
  };

  const save = () => {
    setSaving(true);
    const dataUrl = document.getElementById('canvas').toDataURL();
    const caption = document.getElementById('caption').value;
    axios.post('/api/doodles', {
      url: dataUrl, caption, original_id, doodler_id: user.id,
    })
      .then(() => {
        getAllDoods();
        setTimeout(() => { store.addNotification(options); }, 0);
        history.push('/profile');
      })
      .catch((err) => console.error(err));
  };

  const useStamp = (event) => {
    canvas.__eventListeners['mouse:down'] = [];
    canvas.isDrawingMode = false;
    const { src } = event.target;
    canvas.on('mouse:down', (e) => {
      fabric.Image.fromURL(src, (img) => {
        const posImg = img.set({ left: e.absolutePointer.x - 24, top: e.absolutePointer.y - 24 });
        canvas.add(posImg);
      });
    });
  };

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
        <div className="Doodle-caption">
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
