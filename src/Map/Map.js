import React from 'react'
import { GoogleMap, LoadScript } from '@react-google-maps/api'

const Map = () => {

  return (
    <LoadScript
      id="script-loader"
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_KEY}
    >
      <GoogleMap
        id='example-map'
        mapContainerStyle={{
          height: "90vh",
          width: "90vw",
          margin: "auto",
        }}
        zoom={12}
        center={{
          lat: 29.971065,
          lng: -90.101533
        }}
      >
        <h1>Doodle Map</h1>
      </GoogleMap>
    </LoadScript>
  )
}

export default Map
