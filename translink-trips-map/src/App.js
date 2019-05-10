import React, { Component } from 'react';
// import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import  {APP_NAME } from './components/constants';
import './App.css';
// import GoogleMap from './components/GoogleMap';
import ParseCSV from './components/ParseCSV';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className="App">
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="/logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />
            {APP_NAME}
          </Navbar.Brand>
        </Navbar>
        <div style={{height: '70vh'}}>
          {/* <GoogleMap/> */}
        </div>
        <div>
          <ParseCSV/>
        </div>
        
      </div>
    );
  }
}

export default App;
