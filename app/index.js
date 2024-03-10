import React, { useState } from "react";
import { TextInput, View } from "react-native";
import { Link } from "expo-router";
import AuthInput from "../components/AuthInput";

const App = () => {
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <AuthInput
        placeholder={"phone number"}
        keyboardType="email-address"
        value={state.email}
        onChangeText={(e) => setState((prev) => ({ ...prev, email: e }))}
      />
      <AuthInput
        placeholder={"phone number"}
        secureTextEntry
        // passwordRules={
        //   "required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
        // }
        value={state.password}
        onChangeText={(e) => setState((prev) => ({ ...prev, password: e }))}
      /> */}
      <Link href="/home">Home</Link>
      <Link href="/chat">Chat</Link>
    </View>
  );
};

export default App;
