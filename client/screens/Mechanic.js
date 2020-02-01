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

export default class Mechanic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lookingForMotorists: false,
      mechanicLocation: null
    };
    this.accetMotoristRequest = this.acceptMotoristRequest.bind(this);
    this.findMotorists = this.findMotorists.bind(this);
    this.socket = null;
  }

  componentDidMount() {
   
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

  findMotorists() {
    if (!this.state.lookingForMotorists) {
      this.setState({ lookingForMotorists: true });

      console.log(this.state.lookingForMotorists);

      this.socket = socketIO.connect("http://192.168.43.178:3000");

      this.socket.on("connect", () => {
        this.socket.emit("motoristRequest");
      });

      this.socket.on("repairRequest", async routeResponse => {
        console.log(routeResponse);
        this.setState({
          lookingForMotosits: false,
          motoristFound: true,
          routeResponse
        });
   
      });

      this.socket.on("MechanicRequest", async routeResponse => {
        console.log(routeResponse);
        this.setState({
          lookingForMotorists: false,
          motoristFound: true,
          routeResponse,
          mechanicLocation: routeResponse
        });
       
      });
    }
  }

  acceptMotoristRequest() {
    const motoristLocation = this.props.pointCoords[
      this.props.pointCoords.length - 1
    ];

    Geolocation.getCurrentPosition(info => {
    
      this.socket.emit("mechanicLocation", {
        latitude: info.coords.latitude,
        longitude: info.coords.longitude
      });
    }, error => error, {timeout: 1000 * 30})
    BackgroundGeolocation.checkStatus(status => {
      
      if (!status.isRunning) {
        BackgroundGeolocation.start(); 
      }
    });

    BackgroundGeolocation.on("location", location => {
   
      this.socket.emit("mechanicLocation", {
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
        }(Motorist)`
      );
    }
  }

  render() {
    let endMarker = null;
    let startMarker = null;
    let findingMotoristActIndicator = null;
    let MotoristSearchText = "Find Mechanic";
    let bottomButtonFunction = this.findMotorists;
    console.log('..........latitude test', this.props.latitude)
    if (!this.props.latitude) return null;
    console.log('..........passed latitude test')
    if (this.state.lookingForMotorists) {
      motoristSearchText = "Looking for Mechanic...";
      findingMotoristActIndicator = (
        <ActivityIndicator
          size="large"
          animating={this.state.lookingForMotorists}
        />
      );
    }

    if (this.state.motoristFound) {
      motoristSearchText = "Mechanic Found! Book?";
      bottomButtonFunction = this.acceptMotoristRequest;
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
          buttonText={motoristSearchText}
        >
          {findingMotoristActIndicator}
        </BottomButton>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  findMechanic: {
    backgroundColor: "black",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center"
  },
  findMechanicText: {
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
