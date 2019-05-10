import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import { DEFAULT_COORD, GMAP_API_KEY } from '../constants';

class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }

  componentDidMount() {

  }

  handleApiLoaded = (map, maps) => {
    // use map and maps objects
  };

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: GMAP_API_KEY }}
          defaultCenter={DEFAULT_COORD.center}
          defaultZoom={DEFAULT_COORD.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
        >
        </GoogleMapReact>
      </div>
    );
  }
}

export default GoogleMap;