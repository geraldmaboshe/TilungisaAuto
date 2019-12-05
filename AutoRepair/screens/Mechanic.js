import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  Text
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import BottomButton from "../components/BottomButton";
import socketIO from "socket.io-client";
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import Geolocation from '@react-native-community/geolocation';

export default class Driver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lookingForPassengers: false,
      driverLocation: null
    };
    this.acceptPassengerRequest = this.acceptPassengerRequest.bind(this);
    this.findPassengers = this.findPassengers.bind(this);
    this.socket = null;
  }

  componentDidMount() {
    // Alert.alert('DRIVER MOUNTED')
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
    });

    BackgroundGeolocation.on("authorization", status => {
      console.log(
        "[INFO] BackgroundGeolocation authorization status: " + status
      );
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(
          () =>
            Alert.alert(
              "App requires location tracking permission",
              "Would you like to open app settings?",
              [
                {
                  text: "Yes",
                  onPress: () => BackgroundGeolocation.showAppSettings()
                },
                {
                  text: "No",
                  onPress: () => console.log("No Pressed"),
                  style: "cancel"
                }
              ]
            ),
          1000
        );
      }
    });
  }

  findPassengers() {
    if (!this.state.lookingForPassengers) {
      this.setState({ lookingForPassengers: true });

      console.log(this.state.lookingForPassengers);

      this.socket = socketIO.connect("http://192.168.43.178:3000");

      this.socket.on("connect", () => {
        this.socket.emit("passengerRequest");
      });

      this.socket.on("taxiRequest", async routeResponse => {
        console.log(routeResponse);
        this.setState({
          lookingForPassengers: false,
          passengerFound: true,
          routeResponse
        });
        // await this.props.getRouteDirections(
        //   routeResponse.geocoded_waypoints[0].place_id
        // );
        // this.map.fitToCoordinates(this.props.pointCoords, {
        //   edgePadding: { top: 140, bottom: 140, left: 20, right: 20 }
        // });
      });

      this.socket.on("MechanicRequest", async routeResponse => {
        console.log(routeResponse);
        this.setState({
          lookingForPassengers: false,
          passengerFound: true,
          routeResponse,
          mechanicLocation: routeResponse
        });
        // await this.props.getRouteDirections(
        //   routeResponse.geocoded_waypoints[0].place_id
        // );
        // this.map.fitToCoordinates(this.props.pointCoords, {
        //   edgePadding: { top: 140, bottom: 140, left: 20, right: 20 }
        // });
      });
    }
  }

  acceptPassengerRequest() {
    const passengerLocation = this.props.pointCoords[
      this.props.pointCoords.length - 1
    ];

    Geolocation.getCurrentPosition(info => {
      // console.log()
      this.socket.emit("driverLocation", {
        latitude: info.coords.latitude,
        longitude: info.coords.longitude
      });
    }, error => error, {timeout: 1000 * 30})
    BackgroundGeolocation.checkStatus(status => {
      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });

    BackgroundGeolocation.on("location", location => {
      //Send driver location to passenger
      this.socket.emit("driverLocation", {
        latitude: location.latitude,
        longitude: location.longitude
      });
    });



    if (Platform.OS === "ios") {
      Linking.openURL(
        `http://maps.apple.com/?daddr=${this.state.mechanicLocation.latitude},${
          this.state.mechanicLocation.longitude
        }`
      );
    } else {
      Linking.openURL(
        `geo:0,0?q=${this.state.mechanicLocation.latitude},${
          this.state.mechanicLocation.longitude
        }(Passenger)`
      );
    }
  }

  render() {
    let endMarker = null;
    let startMarker = null;
    let findingPassengerActIndicator = null;
    let passengerSearchText = "Find Mechanic";
    let bottomButtonFunction = this.findPassengers;
    console.log('..........latitude test', this.props.latitude)
    if (!this.props.latitude) return null;
    console.log('..........passed latitude test')
    if (this.state.lookingForPassengers) {
      passengerSearchText = "Looking for Mechanic...";
      findingPassengerActIndicator = (
        <ActivityIndicator
          size="large"
          animating={this.state.lookingForPassengers}
        />
      );
    }

    if (this.state.passengerFound) {
      passengerSearchText = "Mechanic Found! Book?";
      bottomButtonFunction = this.acceptPassengerRequest;
    }

    if (this.props.pointCoords.length > 1) {
      endMarker = (
        <Marker
          coordinate={this.props.pointCoords[this.props.pointCoords.length - 1]}
        >
          <Image
            style={{ width: 40, height: 40 }}
            source={require("../images/person-marker.png")}
          />
        </Marker>
      );
    }

    return (
      <View style={styles.container}>
        {/* <View>
          <Text>{Alert.alert('AGAIN HERE')}</Text>
        </View> */}
        <MapView
          ref={map => {
            this.map = map;
          }}
          style={styles.map}
          region={{
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
          {endMarker}
          {startMarker}
        </MapView>
        <BottomButton
          onPressFunction={bottomButtonFunction}
          buttonText={passengerSearchText}
        >
          {findingPassengerActIndicator}
        </BottomButton>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  findDriver: {
    backgroundColor: "black",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center"
  },
  findDriverText: {
    fontSize: 20,
    color: "white",
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
