import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {
  parseCSVToArray,
  getDaysOfWeek,
  getUsageByHour,
  sumByTransportType,
  getStartAndEndDate,
  getLocationCount,
  getBalance,
} from './parseUtil';
import UsageWeekly from '../UsageWeekly';
import UsageByHour from '../UsageByHour';
import GoogleMap from '../GoogleMap';
import BalanceTimeSeries from '../BalanceTimeSeries';
import Alert from 'react-bootstrap/Alert';

class ParseCSV extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tripFile: '',
      tripArray: '',
      fileName: '',
      usageByDayOfWeek: [],
      usageByHour: [],
      sumTransportType: [],
      startDate: '',
      endDate: '',
      locationCount: {},
      blanceTimeSeires: [],
    };

    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleTextAreaUpdate = this.handleTextAreaUpdate.bind(this);

    this.fileInput = React.createRef();
    this.fileOutput = React.createRef();
  }

  componentDidMount() {

  }

  handleFileUpload(event) {
    event.preventDefault();
    let self = this;

    if (this.fileInput.current.files && this.fileInput.current.files[0]) {
      console.log("selected file: " + this.fileInput.current.files[0].name);
      let receivedFile = this.fileInput.current.files[0];
      let fReader = new FileReader();

      fReader.addEventListener('load', function (e) {
        let csv = e.target.result;
        let parsedArray = parseCSVToArray(csv);
        let daysOfWeekCount = getDaysOfWeek(parsedArray);
        let usageByHour = getUsageByHour(parsedArray);
        let sumTransportType = sumByTransportType(parsedArray);
        let startEndDate = getStartAndEndDate(parsedArray);
        let locationCount = getLocationCount(parsedArray);
        let blanceTimeSeires = getBalance(parsedArray);
        self.setState({
          tripFile: csv,
          tripArray: parsedArray,
          fileName: receivedFile.name,
          usageByDayOfWeek: daysOfWeekCount,
          usageByHour: usageByHour,
          sumTransportType: sumTransportType,
          startDate: startEndDate[0],
          endDate: startEndDate[1],
          locationCount: locationCount,
          blanceTimeSeires: blanceTimeSeires,
        });
      });
      fReader.readAsBinaryString(receivedFile);
    }

  }

  handleTextAreaUpdate() {
    console.log("text area updated!");
  }

  render() {
    return (
      <div className="">
        <h4>Upload Compass Card .csv File</h4>
        <Container>
          <Row>
            <Col md={{ span: 6, offset: 3 }}>

              <div className="custom-file">
                <input type="file" className="custom-file-input" id="customFileLang" ref={this.fileInput}
                  onChange={this.handleFileUpload} />
                <label className="custom-file-label" htmlFor="customFileLang" placeholder="upload file" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{this.state.fileName}</label>
              </div>
            </Col>
          </Row>
        </Container>

        <hr />
        <Container>
          <h4>Activity Breakdown</h4>
          {this.state.tripArray &&
            <div>
              <Row>
                <Table striped bordered>
                  <thead>
                    <tr>
                      <th>Bus</th>
                      <th>Tap in</th>
                      <th>Transfer</th>
                      <th>Tap out</th>
                      <th>Purchase/Web Order</th>
                      <th>Loaded</th>
                      <th>Removed</th>
                      <th>Uncategorized</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {this.state.sumTransportType.map((transportCount, index) =>
                        <td key={'transportCount' + index}>{transportCount}</td>
                      )}
                    </tr>
                  </tbody>
                </Table>

              </Row>
              <Alert variant="info">
                <Alert.Heading>Thanks for taking Public Transit!</Alert.Heading>
                <hr/>
                <div>From <b>{this.state.startDate}</b> to <b>{this.state.endDate}</b> you have taken public transit <b>{
                  this.state.sumTransportType[0] + this.state.sumTransportType[1] + this.state.sumTransportType[2]
                }</b> times.
                </div>
              </Alert>

            </div>
          }
        </Container>
        {
          this.state.tripArray &&
          <Row>
            <Col>
              <h4>Trips By Days of the Week</h4>
              <UsageWeekly data={this.state.usageByDayOfWeek} />
            </Col>
            <Col>
              <h4>Trips by Hour</h4>
              <UsageByHour data={this.state.usageByHour} />
            </Col>
            <Col>
              <h4>Account Balance</h4>
              <BalanceTimeSeries data={this.state.blanceTimeSeires} />
            </Col>
          </Row>
        }
        <hr />
        <h4>Visited Locations</h4>
        {
          this.state.tripArray &&
          <Container>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Location</th>
                  <th># of Visits</th>
                </tr>
              </thead>
              <tbody>
                {this.state.locationCount.map((location) =>
                  <tr key={'row' + location[0]}>
                    <td>{location[0]}</td>
                    <td>{location[1]}</td>
                  </tr>)}
              </tbody>
            </Table>
          </Container>
        }

        <hr />
        <h4>Location Map</h4>
        {
          this.state.tripArray &&
          <div style={{ height: '80vh' }}>
            {/* <GoogleMap/> */}
          </div>
        }
        <hr />
        <h4>CSV Details</h4>
        {
          this.state.tripArray &&
          <Table striped bordered hover variant="dark" size="sm">
            <thead>
              <tr>
                {this.state.tripArray[0].map((columnName, index) => <th key={'col' + index}>{columnName}</th>)}
              </tr>
            </thead>
            <tbody>
              {this.state.tripArray.map((row, index) =>
                <tr key={'row' + index}>
                  {
                    index !== 0 &&
                    row.map((rowItem, rowIndex) => <td key={'row' + index + 'col' + rowIndex}>{rowItem}</td>)
                  }

                </tr>)}
            </tbody>
          </Table>
        }
      </div >
    );
  }
}

export default ParseCSV;
