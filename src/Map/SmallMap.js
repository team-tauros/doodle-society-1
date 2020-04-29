import React, { useState } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

const SmallMap = () => {
  const [mapRef, setMapRef] = useState(null);
  const [center, setCenter] = useState({ lat: 29.971065, lng: -90.101533 });
  const [coords, setCoords] = useState(center);


  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY
  });

  const renderMap = () => {
    return (
      <GoogleMap
        id='example-map'
        mapContainerStyle={{
          height: "43vh",
          width: "28vw",
          "margin-top": "20px",
          "margin-bottom": "20px",
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
