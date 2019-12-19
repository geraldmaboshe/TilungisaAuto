import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import Mechanic from "./screens/Mechanic";
import Motorist from "./screens/Motorist";
import Login from "./screens/Login";
import GenericContainer from "./components/GenericContainer";
import Home from "./screens/Home";

const DriverWithGenericContainer = GenericContainer(Mechanic);
const PassengerWithGenericContainer = GenericContainer(Motorist);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMechanic: false,
      isMotorist: false,
      token: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(name, value) {
    this.setState({ [name]: value });
  }

  render() {
    if (this.state.token === "") {
      return <Login handleChange={this.handleChange} />;
    }

    if (this.state.isMechanic) {
      return <DriverWithGenericContainer token={this.state.token} />;
    }

    if (this.state.isMotorist) {
      return <PassengerWithGenericContainer token={this.state.token} />;
    }

    return <Home handleChange={this.handleChange} />;
  }
}
