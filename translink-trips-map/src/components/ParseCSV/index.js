import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { parseCSVToArray, getDaysOfWeek } from './parseUtil';
import UsageWeekly from '../UsageWeekly';

class ParseCSV extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tripFile: '',
      tripArray: '',
      fileName: '',
      usageByDayOfWeek: [],
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
        self.setState({
          tripFile: csv,
          tripArray: parsedArray,
          fileName: receivedFile.name,
          usageByDayOfWeek: daysOfWeekCount,
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
        <h4>Usage By Days of the Week</h4>
        {
          this.state.tripArray &&
          <Table striped bordered>
            <thead>
              <tr>
                <th>Sunday</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {this.state.usageByDayOfWeek.map((dayNum, index) =>
                  index < 7 &&
                  <td key={'day' + index}>{dayNum}</td>
                )}
              </tr>
            </tbody>
          </Table>
        }

        <hr />
        <h4>Usage by Days - Graph Version</h4>
        {
          this.state.tripArray &&
          <UsageWeekly data={this.state.usageByDayOfWeek}/>
        }
        <hr/>
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
