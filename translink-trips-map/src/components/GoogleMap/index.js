import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import { DEFAULT_COORD, GMAP_API_KEY, LIGHT_BLUE, DARK_BLUE } from '../constants';

class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      map: null,
      maps: null,
      markers: [],
      placesService: null,
    };

    this.placesApiCallback = this.placesApiCallback.bind(this);
    this.handleMapUpdate = this.handleMapUpdate.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {
    if (this.props.locations !== prevProps.locations) {
      this.handleMapUpdate();
    }
  }

  placesApiCallback(results, status, request, maps, map, newMarkers) {
    if (status === maps.places.PlacesServiceStatus.OK) {
      // console.log(results[0]);
      console.log(results[0].name + " --> " + request.query + " count: " + request.usageCount);
      // console.log(request);

      let marker = new maps.Marker({
        position: results[0].geometry.location,
        icon: { url: '', size: new maps.Size(0, 0), origin: new maps.Point(0, 0), anchor: new maps.Point(0, 0) },
        label: {
          text: String(request.usageCount),
          color: DARK_BLUE,
          fontSize: '1.5em',
          fontWeight: 'bold',
        },
        map: map
      });

      let circle = new maps.Circle({
        strokeColor: DARK_BLUE,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: LIGHT_BLUE,
        fillOpacity: 0.5,
        map: map,
        center: results[0].geometry.location,
        label: String(request.usageCount),
        radius: Math.sqrt(request.usageCount) * 200
      });

      newMarkers.push(marker);
      newMarkers.push(circle);
    }
    else {
      console.log("not found! --> " + request.query);
    }
  }

  handleApiLoaded = (map, maps) => {
    // use map and maps objects

    let placesService = new maps.places.PlacesService(map);
    let newMarkers = [];

    let transitLayer = new maps.TransitLayer();
    transitLayer.setMap(map);

    for (let i = 0; i < this.props.locations.length; i++) {
      let location = this.props.locations[i][0];
      // generate query object
      let request = {
        query: location,
        usageCount: this.props.locations[i][1],
        fields: ['name', 'geometry'],
        location: DEFAULT_COORD.center,
        rankby: 'distance'
      };
      placesService.textSearch(request, (results, status) => this.placesApiCallback(results, status, request, maps, map, newMarkers));
    }

    this.setState({
      map: map,
      maps: maps,
      markers: newMarkers,
      placesService: placesService
    });
  };

  handleMapUpdate() {
    let newMarkers = [];

    for (let i = 0; i < this.props.locations.length; i++) {
      let location = this.props.locations[i][0];
      // generate query object
      let request = {
        query: location,
        usageCount: this.props.locations[i][1],
        fields: ['name', 'geometry'],
        location: DEFAULT_COORD.center,
        rankby: 'distance',
        types: [
          'bus_station',
          'subway_station',
          'transit_station',
          'train_station',
        ],
      };

      // clear previous markers
      for (let i = 0; i < this.state.markers.length; i++) {
        this.state.markers[i].setMap(null);
      }
      this.state.placesService.textSearch(request, (results, status) => this.placesApiCallback(results, status, request, this.state.maps, this.state.map, newMarkers));
    }

    this.setState({
      markers: newMarkers,
    })
  }

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

GoogleMap.propTypes = {
  locations: PropTypes.array
};

export default GoogleMap;