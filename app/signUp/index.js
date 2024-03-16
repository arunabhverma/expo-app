import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Link, router } from "expo-router";

const SignUp = () => {
  const [state, setState] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const cleanState = () => {
    setState((prev) => ({
      ...prev,
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    }));
  };

  const signUp = () => {
    auth()
      .createUserWithEmailAndPassword(state.email, state.password)
      .then((e) => {
        firestore()
          ?.collection("Users")
          ?.add({
            user_id: e.user.uid,
            first_name: state.first_name,
            last_name: state.last_name,
            email: state.email,
          })
          .then(() => {
            Alert.alert("User account created & signed in!");
            cleanState();
            router.push({
              pathname: "/",
            });
          });
      })
      .catch((error) => {
        cleanState();
        if (error.code === "auth/email-already-in-use") {
          console.log("That email address is already in use!");
        }
        if (error.code === "auth/invalid-email") {
          console.log("That email address is invalid!");
        }
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Sign Up</Text>
      <TextInput
        placeholder="First Name"
        style={styles.inputStyle}
        value={state.first_name}
        onChangeText={(e) => setState((prev) => ({ ...prev, first_name: e }))}
      />
      <TextInput
        placeholder="Last Name"
        style={styles.inputStyle}
        value={state.last_name}
        onChangeText={(e) => setState((prev) => ({ ...prev, last_name: e }))}
      />
      <TextInput
        placeholder="Email"
        style={styles.inputStyle}
        value={state.email}
        onChangeText={(e) => setState((prev) => ({ ...prev, email: e }))}
      />
      <TextInput
        placeholder="Password"
        style={styles.inputStyle}
        value={state.password}
        onChangeText={(e) => setState((prev) => ({ ...prev, password: e }))}
      />

      <Button title="Sign Up" onPress={() => signUp()} />
      <Link href={"/"}>Login</Link>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
    gap: 10,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
  },
  inputStyle: {
    padding: 0,
    backgroundColor: "rgb(245, 245, 245)",
  },
});
