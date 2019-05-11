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
  getStartAndEndDate
} from './parseUtil';
import UsageWeekly from '../UsageWeekly';
import UsageByHour from '../UsageByHour';

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
      endDate: ''
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
        self.setState({
          tripFile: csv,
          tripArray: parsedArray,
          fileName: receivedFile.name,
          usageByDayOfWeek: daysOfWeekCount,
          usageByHour: usageByHour,
          sumTransportType: sumTransportType,
          startDate: startEndDate[0],
          endDate: startEndDate[1],
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
              <div>From {this.state.startDate} to {this.state.endDate} you have taken public transit {
                this.state.sumTransportType[0] + this.state.sumTransportType[1] + this.state.sumTransportType[2]
              } times.
              </div>
            </div>
          }
        </Container>
        <hr />
        <Row>
          <Col>
            <h4>Trips By Days of the Week</h4>
            {
              this.state.tripArray &&
              <UsageWeekly data={this.state.usageByDayOfWeek} />
            }
          </Col>
          <Col>
            <h4>Trips by Hour</h4>
            {
              this.state.tripArray &&
              <UsageByHour data={this.state.usageByHour} />
            }
          </Col>
        </Row>
        <hr />
        <h4>CSV Details</h4>
        {
          this.state.tripArray &&
          <Table striped bordered hover variant="dark">
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
      </div>
    );
  }
}

export default ParseCSV;
