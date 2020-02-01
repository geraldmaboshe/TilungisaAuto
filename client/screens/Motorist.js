import React, { Component } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  ActivityIndicator
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
// import apiKey from "../google_api_key";
import _ from "lodash";
import socketIO from "socket.io-client";
import BottomButton from "../components/BottomButton";
import Geolocation from '@react-native-community/geolocation';

export default class Motorist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lookingForMechanic: false,
      mechanicIsOnTheWay: false,
      predictions: [],
      mechanicLocation: null
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${'AIzaSyArVMQjscvhmO1dNEYa75A-8gSxOawJp6I'}
    &input=${destination}&location=${this.props.latitude},${
      this.props.longitude
    }&radius=2000`;
    console.log(apiUrl);
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions
      });
      console.log(json);
    } catch (err) {
      console.error(err);
    }
  }

  async requestMechanic() {
    this.setState({ lookingForMechanic: true });
    var socket = socketIO.connect("http://192.168.43.178:3000");

    socket.on("connect", () => {
      console.log("client connected");
 
      socket.emit("repairRequest", this.props.routeResponse);
      socket.emit("MechanicRequest", {latitude:this.props.latitude,longitude:this.props.longitude});
      this.setState({mechanicLocation: {latitude:this.props.latitude,longitude:this.props.longitude}})
    });

    socket.on("mechanicLocation", mechanicLocation => {
      console.log('point cordinates', mechanicLocation)
      const pointCoords = [...this.props.pointCoords, mechanicLocation];
    
      this.setState({
        lookingForMechanic: false,
        mechanicIsOnTheWay: true,
        mechanicLocation: mechanicLocation
      });
    });
  }

  getCurrentLocation(){

  }
  render() {
    let marker = null;
    let getMechanic = null;
    let findingMechanicActIndicator = null;
    let mechanicMarker = null;

    if (!this.props.latitude) return null;

    if (this.state.mechanicIsOnTheWay) {
      mechanicMarker = (
        <Marker coordinate={this.state.mechanicLocation}>
          {/* <Image
            source={require("../images/carIcon.png")}
            style={{ width: 40, height: 40 }}
          /> */}
        </Marker>
      );
    }

    if (this.state.lookingForMechanic) {
      findingMechanicActIndicator = (
        <ActivityIndicator
          size="large"
          animating={this.state.lookingForMechanic}
        />
      );
    }

    if (this.props.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.props.pointCoords[this.props.pointCoords.length - 1]}
        />
      );
      getMechanic = (
        <BottomButton
          onPressFunction={() => this.requestMechanic()}
          buttonText="Accepting request"
        >
          {findingMechanicActIndicator}
        </BottomButton>
      );ss
    }

    const predictions = this.state.predictions.map(prediction => (
      <TouchableHighlight
        onPress={async () => {
          const destinationName = await this.props.getRouteDirections(
            prediction.place_id,
            prediction.structured_formatting.main_text
          );
          this.setState({ predictions: [], destination: destinationName });
          // this.map.fitToCoordinates(this.props.pointCoords, {
          //   edgePadding: { top: 20, bottom: 20, left: 20, right: 20 }
          // });
        }}
        key={prediction.id}
      >
        <View>
          <Text style={styles.suggestions}>
            {prediction.structured_formatting.main_text}
          </Text>
        </View>
      </TouchableHighlight>
    ));

    return (
      <View style={styles.container}>
        <MapView
          ref={map => {
            this.map = map;
          }}
          style={styles.map}
          initialRegion={{
            latitude: this.props.latitude,
            longitude: this.props.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121
          }}
          showsUserLocation={true}
        >
          <Polyline
            coordinates={this.props.pointCoords}
            strokeWidth={4}
            strokeColor="red"
          />
          {marker}
          {mechanicMarker}
        </MapView>
        
        {getMechanic}
        <BottomButton
          onPressFunction={() => this.requestMechanic()}
          buttonText="Accept request"
        >
          {findingMechanicActIndicator}
        </BottomButton>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  findMechanic: {
    backgroundColor: "#3C5580",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center",
    borderRadius: 10
  },
  findMechanicText: {
    fontSize: 20,
    color: "#ffa500",
    fontWeight: "600"
  },
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5
  },
  destinationInput: {
    height: 40,
    borderWidth: 0.5,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white"
  },
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
