import React from "react";
import { Button, View, TextInput, Text, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import PressableOpacity from "../../../components/PressableOpacity";

const CustomTextInput = React.forwardRef((props, ref) => {
  return (
    <View style={styles.container}>
      {props.isEmoji ? (
        <View style={styles.buttonOverFlow}>
          <PressableOpacity
            style={styles.buttonStyle}
            onPress={props.onKeyboard}
          >
            <Entypo name="emoji-flirt" size={24} color="dimgrey" />
          </PressableOpacity>
        </View>
      ) : (
        <View style={styles.buttonOverFlow}>
          <PressableOpacity style={styles.buttonStyle} onPress={props.onEmoji}>
            <MaterialIcons name="keyboard" size={24} color="dimgrey" />
          </PressableOpacity>
        </View>
      )}
      <TextInput
        ref={ref}
        value={props.value}
        onFocus={props.onFocus}
        onChangeText={props.onChangeText}
        style={styles.inputStyle}
      />
      <Button title={"push"} onPress={props.onSend} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    margin: 5,
    // backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 100,
    borderWidth: 1,
    paddingVertical: 3,
  },
  inputStyle: {
    flex: 1,
    // backgroundColor: "red",
    borderWidth: 1,
    marginLeft: 3,
    padding: 0,
    fontSize: 20,
  },
  buttonOverFlow: {
    borderRadius: 100,
    overflow: "hidden",
    width: 38,
    height: 38,
    borderWidth: 1,
  },
  buttonStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

export default CustomTextInput;
