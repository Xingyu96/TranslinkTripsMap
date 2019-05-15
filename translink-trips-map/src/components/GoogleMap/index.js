import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import { DEFAULT_COORD, GMAP_API_KEY, LIGHT_BLUE, DARK_BLUE, RECT_BOUNDS } from '../constants';
import { wait } from '../ParseCSV/parseUtil';

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
    this.performQueries = this.performQueries.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.handleMapUpdate();
    }
  }

  placesApiCallback(results, status, request, maps, map, newMarkers, itemNum, iteration) {

    if (iteration >= 3) return;

    if (status === maps.places.PlacesServiceStatus.OK) {

      // console.log(results[0]);
      console.log("item " + itemNum + " was found: " + results[0].name + " --> " + request.query + " count: " + request.usageCount);
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
      console.log("iteration " + iteration + " item " + itemNum + " not found! --> " + request.query);
      console.log(status);
      wait(2000);
      this.state.placesService.textSearch(request, (results, status) => this.placesApiCallback(results, status, request, maps, map, newMarkers, itemNum, iteration + 1));
    }
  }

  handleApiLoaded = (map, maps) => {
    // use map and maps objects

    let placesService = new maps.places.PlacesService(map);
    let newMarkers = [];

    let transitLayer = new maps.TransitLayer();
    transitLayer.setMap(map);

    this.performQueries(maps, map, newMarkers, placesService);

    this.setState({
      map: map,
      maps: maps,
      markers: newMarkers,
      placesService: placesService
    });
  };

  handleMapUpdate() {
    let newMarkers = [];

    // clear previous markers
    for (let i = 0; i < this.state.markers.length; i++) {
      this.state.markers[i].setMap(null);
    }

    this.performQueries(this.state.maps, this.state.map, newMarkers, this.state.placesService);

    this.setState({
      markers: newMarkers,
    })
  }

  performQueries(maps, map, newMarkers, placesService) {
    for (let i = 0; i < this.props.locations.length; i++) {
      let location = String(this.props.locations[i][0]);
      // try to improve bus search result
      // if(location.includes("Bus Stop")){
      //   location = location.replace("Bus Stop", "Bus Stop Stop id");
      // }

      if (location.includes("Stn")) {
        location = location.replace("Stn", "station");
      }

      // generate query object
      let request = {
        query: location,
        usageCount: this.props.locations[i][1],
        fields: ['name', 'geometry'],
        location: DEFAULT_COORD.center,
        rankby: 'distance',
        locationBias: RECT_BOUNDS
      };

      placesService.textSearch(request, (results, status) => this.placesApiCallback(results, status, request, maps, map, newMarkers, i, 0));
    }
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