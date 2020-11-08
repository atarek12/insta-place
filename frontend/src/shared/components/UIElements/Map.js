import React, { useRef, useEffect } from 'react';

import './Map.css';

const Map = props => {

  // assign a refrence to the map div
  const mapRef = useRef();

  // destruct the props
  const { center, zoom } = props;

  // on mounting --> create our map
  useEffect(() => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom
    });

    // show the red pin in our location
    new window.google.maps.Marker({ position: center, map: map });
  }, [center, zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
    ></div>
  );
};

export default Map;
