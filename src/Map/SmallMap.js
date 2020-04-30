import React, { useState } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

const SmallMap = ({ setCoords }) => {
  const [mapRef, setMapRef] = useState(null);
  const [center, setCenter] = useState({ lat: 29.971065, lng: -90.101533 });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY
  });

  const options = {
      zoomControl: true,
      fullscreenControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
    }

  const renderMap = () => {
    return (
      <GoogleMap
        id='example-map'
        options={options}
        mapContainerStyle={{
          height: "44vh",
          width: "29vw",
          "marginBottom": "20px",
          border: "solid blue 4px",
          "borderRadius": "10px",
        }}
        zoom={11}
        center={center}
        onLoad={map => setMapRef(map)}
      >
        {<Marker
          position={center}
          draggable={true}
          onDragEnd={(e) => {
            const markerLocation = e.latLng.toString().replace(/\(|\)|,/g, '').split(' ').map(x=>+x);
            setCoords({lat: markerLocation[0], lng: markerLocation[1]});
          }}
        />}
      </GoogleMap>
    )
  }
  return isLoaded ? renderMap() : null;
}

export default SmallMap
