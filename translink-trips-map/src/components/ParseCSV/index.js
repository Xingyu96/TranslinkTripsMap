import React, { Component } from 'react';

class ParseCSV extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tripFile: '',
    };

    this.handleFileInput = this.handleFileInput.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleTextAreaUpdate = this.handleTextAreaUpdate.bind(this);

    this.fileInput = React.createRef();
    this.fileOutput = React.createRef();
  }

  componentDidMount() {
    this.handleFileInput();
  }

  handleFileInput() {
    // let input = this.fileInput;
    // let output = this.fileOutput;

    // input.addEventListener('change', function () {
    //   if (this.files && this.files[0]) {
    //     let receivedFile = this.files[0];
    //     let reader = new FileReader();

    //     reader.addEventListener('load', function (e) {
    //       output.textContent = e.target.result;
    //     });

    //     reader.readAsBinaryString(receivedFile);
    //   }
    // });
  }

  handleFileUpload(event) {
    event.preventDefault();
    let self = this;

    if (this.fileInput.current.files && this.fileInput.current.files[0]){
      console.log("selected file: " + this.fileInput.current.files[0].name);
      let receivedFile = this.fileInput.current.files[0];
      let fReader = new FileReader();

      fReader.addEventListener('load', function(e){
        self.setState({ tripFile: e.target.result });
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
        <input type="file" id="myFile" ref={this.fileInput} onChange={this.handleFileUpload} />
        <hr />
        <textarea style={{ width: '500px', height: '400px' }} id="output" ref={this.fileOutput} onChange={this.handleTextAreaUpdate} value={this.state.tripFile}></textarea>
      </div>
    );
  }
}

export default ParseCSV;
