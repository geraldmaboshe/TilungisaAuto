import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Image
} from "react-native";

export default class LoginForm extends Component {
  render() {
    return (
      <View style={styles.view}>
        <Image 
        source={require("../images/logo.jpeg")}
        style={styles.image}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#000000"
          value={this.props.email}
          onChangeText={email => this.props.handleChange("email", email)}
        />
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#000000"
          value={this.props.password}
          onChangeText={pw => this.props.handleChange("password", pw)}
        />
        <TouchableOpacity
          onPress={this.props.handleSignIn}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <Text style = {styles.orText}>
          Or
        </Text>
        <TouchableOpacity
          onPress={this.props.handleSignUp}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  view:{
    margin:20,
    borderRadius:30

  },
  input: {
    height: 40,
    padding: 10,
    backgroundColor: "#ffffff",
    color: "#000000",
    marginBottom: 10,
    fontFamily:"Arial"
  },
  button: {
    backgroundColor: "#ffa500",
    paddingVertical: 10,
    marginVertical: 10
  },
  buttonText: {
    textAlign: "center",
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "200",
    fontFamily: Platform.OS === "android" ? "Arial" : undefined
  },
  image: {
      width:70,
      height: 70,
      marginLeft:"auto",
      marginRight: "auto",
      marginBottom: 20  
  },
  orText:{
    textAlign:"center",
    color:"#ffffff",
    fontFamily:"Arial",
    fontSize:20
  }
});
