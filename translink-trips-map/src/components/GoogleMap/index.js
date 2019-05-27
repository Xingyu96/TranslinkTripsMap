import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import { DEFAULT_COORD, GMAP_API_KEY, LIGHT_BLUE, DARK_BLUE, RECT_BOUNDS } from '../constants';
import { wait } from '../ParseCSV/parseUtil';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './style.css';
import playSVG from 'open-iconic/svg/media-play.svg';

class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      map: null,
      maps: null,
      markers: [],
      placesService: null,
      playbackSpeed: 2,
      sliderValue: 0,
      playState: "",
    };

    this.placesApiCallback = this.placesApiCallback.bind(this);
    this.handleMapUpdate = this.handleMapUpdate.bind(this);
    this.performQueries = this.performQueries.bind(this);
    this.locationSearch = this.locationSearch.bind(this);
    this.speedChange = this.speedChange.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.playStateChange = this.playStateChange.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.handleMapUpdate();
    }
  }

  placesApiCallback(result, status, request, maps, map, newMarkers, itemNum, iteration) {

    if (status === true) {

      let latLng = { lat: Number(result.stop_lat), lng: Number(result.stop_lon) };

      let marker = new maps.Marker({
        position: latLng,
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
        center: latLng,
        label: String(request.usageCount),
        radius: Math.sqrt(request.usageCount) * 200
      });

      newMarkers.push(marker);
      newMarkers.push(circle);
    }
    else {
      console.log("iteration " + iteration + " item " + itemNum + " not found! --> " + request.query);
      // console.log(status);
      // wait(2000);
      // this.state.placesService.textSearch(request, (results, status) => this.placesApiCallback(results, status, request, maps, map, newMarkers, itemNum, iteration + 1));
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
        usageCount: this.props.locations[i][1].count,
        stopDetail: this.props.locations[i][1].stopDetail,
      };

      this.locationSearch(request, (results, status) => this.placesApiCallback(results, status, request, maps, map, newMarkers, i, 0));
    }
  }

  locationSearch(request, callback) {
    if (request.stopDetail !== null) {
      callback(request.stopDetail, true)
    } else {
      callback(null, false);
    }
  }

  speedChange(newSpeedEvent) {
    console.log("clicked on speed " + newSpeedEvent.target.value);
    for (let i = 0; i < newSpeedEvent.target.parentElement.parentElement.children.length; i++) {
      newSpeedEvent.target.parentElement.parentElement.children[i].classList.remove("active");
    }
    newSpeedEvent.target.parentElement.classList.add("active");
    this.setState({
      playbackSpeed: newSpeedEvent.target.value 
    });
  }

  playStateChange(newPlayState) {
    for (let i = 0; i < newPlayState.target.parentElement.parentElement.children.length; i++) {
      newPlayState.target.parentElement.parentElement.children[i].classList.remove("active");
      newPlayState.target.parentElement.classList.add("active");
      this.setState({
        playState: newPlayState.target.value
      });
    }
  }

  sliderChange(sliderEvent) {
    this.setState({ sliderValue: sliderEvent.target.value });
  }

  render() {
    return (
      <Row style={{ height: '100%', width: '100%', paddingLeft: '30px' }}>
        <Col lg xl="3">
          <h5>Compass Card Activity Playback</h5>

          <br></br>
          <div>
            <input id="mySlider"
              type="range"
              value={this.state.sliderValue}
              min={0}
              max={1000}
              onChange={this.sliderChange}
              step={1}
              style={{ width: '100%' }} />
          </div>
          <br />
          <div className="btn-group btn-group-toggle">
            <label className="btn btn-outline-secondary">
              <input type="radio" name="options" id="option1" value={1} onChange={this.playStateChange} /> <span className="oi oi-media-step-backward" title="icon name" aria-hidden="true"></span>
            </label>
            <label className="btn btn-outline-secondary active">
              <input type="radio" name="options" id="option2" value={3} onChange={this.playStateChange} /> <span className="oi oi-media-pause" title="icon name" aria-hidden="true"></span>
            </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="options" id="option1" value={2} onChange={this.playStateChange} /> <span className="oi oi-media-play" title="icon name" aria-hidden="true"></span>
            </label>
          </div>

          <div style={{ height: "10px" }}></div>

          <div className="btn-group btn-group-toggle">
            <label className="btn btn-outline-secondary active">
              <input type="radio" name="speed" id="option1" value={1} onChange={this.speedChange} /> 1 hr/s
              </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="speed" id="option2" value={2} onChange={this.speedChange} /> 12 hr/s
              </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="speed" id="option3" value={3} onChange={this.speedChange} /> 1 day/s
              </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="speed" id="option3" value={4} onChange={this.speedChange} /> 7 days/s
            </label>
          </div>


        </Col>
        <Col>
          <GoogleMapReact
            bootstrapURLKeys={{ key: GMAP_API_KEY }}
            defaultCenter={DEFAULT_COORD.center}
            defaultZoom={DEFAULT_COORD.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
          />
        </Col>
      </Row>
    );
  }
}

GoogleMap.propTypes = {
  locations: PropTypes.array
};

export default GoogleMap;