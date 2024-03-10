import React from "react";
import { TextInput, View } from "react-native";

const AuthInput = (props) => {
  return (
    <View>
      <TextInput {...props} />
    </View>
  );
};

export default AuthInput;
