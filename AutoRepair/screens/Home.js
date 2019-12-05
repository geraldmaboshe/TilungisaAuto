import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  Platform,
  TouchableOpacity
} from "react-native";

export default class Home extends Component {
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => this.props.handleChange("isMechanic", true)}
          style={[styles.choiceContainer, { borderBottomWidth: 1 }]}
        >
          <Text style={styles.choiceText}>I'm a Motorist</Text>
          <Image
            source={require("../images/passenger.png")}
            style={styles.selectionImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.handleChange("isMotorist", true)}
          style={styles.choiceContainer}
        >
          <Text style={styles.choiceText}>I'm a Mechanic</Text>
          <Image
            source={require("../images/steeringwheel.jpeg")}
            style={styles.selectionImage}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3A3743"
  },
  choiceText: {
    fontSize: 32,
    marginBottom: 20,
    fontWeight: "200",
    color: "#FFF",
    fontFamily: Platform.OS === "android" ? "sans-serif-light" : undefined
  },
  choiceContainer: {
    flex: 1,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center"
  },
  selectionImage: {
    height: 200,
    width: 200
  }
});
