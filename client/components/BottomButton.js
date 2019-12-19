import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

export default class BottomButton extends Component {
  render() {
    return (
      <View style={styles.bottomButton}>
        <TouchableOpacity onPress={() => this.props.onPressFunction()}>
          <View>
            <Text style={styles.bottomButtonText}>{this.props.buttonText}</Text>
            {this.props.children}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

BottomButton.propTypes = {
  onPressFunction: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  bottomButton: {
    backgroundColor: "#3C5580",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center",
    borderRadius: 10
  },
  bottomButtonText: {
    fontSize: 20,
    color: "#ffa500",
    fontWeight: "600"
    
    
  }
});
