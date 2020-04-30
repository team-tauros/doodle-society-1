import React, { useState, useEffect, Fragment } from 'react'
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api'

const Map = ({ doods }) => {
  const [ selectedDoodle, setSelectedDoodle ] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [center] = useState({ lat: 29.972065, lng: -90.111533 });
  const [markers, setMarkers] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
  });

  // super handy function that is not documented well
  const logTheCurrentCenter = () =>{
    console.log(mapRef.center.toJSON());
  }

  useEffect(()=> {
    if(doods[1]) {
      setMarkers(doods[1])
      console.log(doods[1])
    }
  }, [doods])

  const renderMap = () => (
    <Fragment>
      <h1>Doodle Map</h1>
      <GoogleMap
        id='example-map'
        mapContainerStyle={{
          height: "75vh",
          width: "80vw",
          margin: "auto",
          "borderRadius": "20px",
          border: "solid blue 4px",
        }}
        zoom={12}
        center={center}
        onLoad={map => setMapRef(map)}
      >
      {markers ? (
        markers.map((dood) => {
          const lat = +dood.lat;
          const lng = +dood.lng;
          dood.coords = { lat, lng };
          return (
            <Marker
              key={dood.id}
              position={dood.coords}
              onClick={() => setSelectedDoodle(dood)}
            />
          )
        })
      ) : null}
      {selectedDoodle && (
        <InfoWindow position={selectedDoodle.coords} onCloseClick={() => setSelectedDoodle(null)}>
          <div>
            <h6>{selectedDoodle.username}</h6>
              <img style={{height: "15vh", width: "auto"}} className="doodle" src={selectedDoodle.url} alt="" />
              <img style={{height: "15vh", width: "auto"}} className="bg-img" src={selectedDoodle.original_url} alt="" />
              <p style={{marginTop: "5px", marginBottom: "0px"}}>{selectedDoodle.caption}</p>
          </div>
        </InfoWindow>
      )}
      </GoogleMap>
    </Fragment>
  )

  return isLoaded ? renderMap() : null;
}

export default Map
