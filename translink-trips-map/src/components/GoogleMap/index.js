import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import {
  DEFAULT_COORD,
  GMAP_API_KEY,
  LIGHT_BLUE,
  DARK_BLUE,
  TO_START,
  PAUSE,
  PLAY,
  PLAYBACK,
} from '../constants';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './style.css';
import { dateNumberToString } from '../ParseCSV/parseUtil';

class GoogleMap extends Component {
  constructor(props) {
    super(props);
    // refs
    this.playBackStateButtonGroup = React.createRef();

    this.state = {
      date: new Date(),
      map: null,
      maps: null,
      markers: [],
      placesService: null,
      playbackSpeed: 0,
      sliderValue: 0,
      playState: 1,
      parsedStartDate: 0,
      parsedEndDate: 1,
      playIntervalFunc: null,
    };

    this.placesApiCallback = this.placesApiCallback.bind(this);
    this.handleMapUpdate = this.handleMapUpdate.bind(this);
    this.performQueries = this.performQueries.bind(this);
    this.locationSearch = this.locationSearch.bind(this);
    this.speedChange = this.speedChange.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderInput = this.sliderInput.bind(this);
    this.playStateChange = this.playStateChange.bind(this);
    this.handleToStart = this.handleToStart.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.incrementSliderPlay = this.incrementSliderPlay.bind(this);
    this.clearSliderPlay = this.clearSliderPlay.bind(this);
  }

  componentDidMount() {
    let parsedStartDate = Date.parse(this.props.startDate);
    let parsedEndDate = Date.parse(this.props.endDate);

    this.setState({
      parsedStartDate: parsedStartDate,
      parsedEndDate: parsedEndDate,
      sliderValue: parsedStartDate
    });

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
    for (let i = 0; i < newSpeedEvent.target.parentElement.parentElement.children.length; i++) {
      newSpeedEvent.target.parentElement.parentElement.children[i].classList.remove("active");
    }
    newSpeedEvent.target.parentElement.classList.add("active");

    let newSpeed = Number(newSpeedEvent.target.value);
    this.setState({
      playbackSpeed: newSpeed
    });

    // clear current play function interval, start one at right speed
    if (this.state.playState === PLAY) {
      this.clearSliderPlay();
      this.handlePlay(newSpeed);
    }
  }

  playStateChange(newPlayState) {
    // set button styles
    for (let i = 0; i < newPlayState.target.parentElement.parentElement.children.length; i++) {
      newPlayState.target.parentElement.parentElement.children[i].classList.remove("active");
    }
    newPlayState.target.parentElement.classList.add("active");

    switch (Number(newPlayState.target.value)) {
      case TO_START:
        this.handleToStart();
        break;
      case PAUSE:
        this.handlePause();
        break;
      case PLAY:
        this.clearSliderPlay();
        this.handlePlay(this.state.playbackSpeed);
        break;
      default:
        this.handleToStart();
    }

    this.setState({
      playState: Number(newPlayState.target.value),
    });
  }

  handleToStart() {
    let curPlayFunc = this.state.playIntervalFunc;
    if (curPlayFunc) {
      clearInterval(curPlayFunc);
    }
    this.setState({
      sliderValue: this.state.parsedStartDate,
    });

  }

  handlePause() {
    // stop playing
    this.clearSliderPlay();
  }

  handlePlay(playSpeed) {
    // move slider 
    let funcRef = this.incrementSliderPlay;
    let playFunc = setInterval(function () { funcRef(playSpeed); }, PLAYBACK.REFRESH_RATE);
    this.setState({
      playIntervalFunc: playFunc,
    });
  }

  incrementSliderPlay(playSpeed) {
    // start interval play function
    let curSliderVal = this.state.sliderValue;
    // console.log("playing at speed " + playSpeed + " -- " + curSliderVal);
    let incValue = PLAYBACK.SPEED_1_INC;

    switch (playSpeed) {
      case PLAYBACK.SPEED_1:
        incValue = PLAYBACK.SPEED_1_INC;
        break;
      case PLAYBACK.SPEED_2:
        incValue = PLAYBACK.SPEED_2_INC;
        break;
      case PLAYBACK.SPEED_3:
        incValue = PLAYBACK.SPEED_3_INC;
        break;
      case PLAYBACK.SPEED_4:
        incValue = PLAYBACK.SPEED_4_INC;
        break;
      default:
        incValue = PLAYBACK.SPEED_1_INC;
    }
    // console.log("increment: " + incValue);
    this.setState({ sliderValue: curSliderVal + incValue });
  }

  clearSliderPlay() {
    // clear interval play function
    let curPlayFunc = this.state.playIntervalFunc;
    if (curPlayFunc) {
      clearInterval(curPlayFunc);
      this.setState({ playIntervalFunc: null });
    }
  }

  sliderChange(sliderEvent) {
    // move slider to correct value
    this.setState({ sliderValue: Number(sliderEvent.target.value) });
  }

  sliderInput(sliderEvent) {
    // change to pause graphic
    let playStateBtns = this.playBackStateButtonGroup.current;
    for (let i = 0; i < playStateBtns.children.length; i++) {
      playStateBtns.children[i].classList.remove("active");

    }
    playStateBtns.children[PAUSE].classList.add("active");

    // stop playing
    this.clearSliderPlay();

    // set playstate to pause
    this.setState({ playState: PAUSE });
  }

  render() {
    return (
      <Row style={{ height: '100%', width: '100%', paddingLeft: '30px' }}>
        <Col lg xl="3">
          <h5>Compass Card Activity Playback</h5>

          <br></br>
          <div>
            <input id="mySlider"
              className="playbackSlider"
              type="range"
              value={this.state.sliderValue}
              min={this.state.parsedStartDate}
              max={this.state.parsedEndDate}
              onChange={this.sliderChange}
              onInput={this.sliderInput}
              step={1}
              style={{ width: '100%' }} />
          </div>
          <p>Start: {this.props.startDate} </p>
          <p>End: {this.props.endDate} </p>
          <p>Current: {dateNumberToString(this.state.sliderValue)} </p>

          <br />
          <div className="btn-group btn-group-toggle" ref={this.playBackStateButtonGroup}>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="options" id="option1" value={TO_START} onClick={this.playStateChange} /> <span className="oi oi-media-step-backward" title="icon name" aria-hidden="true"></span>
            </label>
            <label className="btn btn-outline-secondary active">
              <input type="radio" name="options" id="option2" value={PAUSE} onClick={this.playStateChange} /> <span className="oi oi-media-pause" title="icon name" aria-hidden="true"></span>
            </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="options" id="option1" value={PLAY} onClick={this.playStateChange} /> <span className="oi oi-media-play" title="icon name" aria-hidden="true"></span>
            </label>
          </div>

          <div style={{ height: "10px" }}></div>

          <div className="btn-group btn-group-toggle">
            <label className="btn btn-outline-secondary active">
              <input type="radio" name="speed" id="option1" value={PLAYBACK.SPEED_1} onChange={this.speedChange} /> 1 hr/s
              </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="speed" id="option2" value={PLAYBACK.SPEED_2} onChange={this.speedChange} /> 12 hr/s
              </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="speed" id="option3" value={PLAYBACK.SPEED_3} onChange={this.speedChange} /> 1 day/s
              </label>
            <label className="btn btn-outline-secondary">
              <input type="radio" name="speed" id="option3" value={PLAYBACK.SPEED_4} onChange={this.speedChange} /> 7 days/s
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
            style={{ height: '80vh' }}
          />
        </Col>
      </Row>
    );
  }
}

GoogleMap.propTypes = {
  locations: PropTypes.array,
  tripArray: PropTypes.array,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default GoogleMap;