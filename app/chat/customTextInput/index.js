import React from "react";
import { Button, View, TextInput, Text, StyleSheet } from "react-native";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import PressableOpacity from "../../../components/PressableOpacity";

const CustomTextInput = React.forwardRef((props, ref) => {
  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 5,
        marginVertical: 7,
        gap: 5,
      }}
    >
      <View style={styles.container}>
        {props.isEmoji ? (
          <View style={styles.buttonOverFlow}>
            <PressableOpacity
              style={styles.buttonStyle}
              onPress={props.onKeyboard}
            >
              <MaterialIcons name="keyboard" size={24} color="dimgrey" />
            </PressableOpacity>
          </View>
        ) : (
          <View style={styles.buttonOverFlow}>
            <PressableOpacity
              style={styles.buttonStyle}
              onPress={props.onEmoji}
            >
              <Entypo name="emoji-flirt" size={24} color="dimgrey" />
            </PressableOpacity>
          </View>
        )}
        <TextInput
          ref={ref}
          value={props.value}
          onFocus={props.onFocus}
          onChangeText={props.onChangeText}
          style={styles.inputStyle}
          {...props}
        />
      </View>
      <View style={styles.sendButtonWrapper}>
        <PressableOpacity style={styles.sendButtonStyle} onPress={props.onSend}>
          <Feather name="send" size={20} color="white" />
        </PressableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 100,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
  inputStyle: {
    flex: 1,
    marginLeft: 3,
    padding: 0,
    fontSize: 20,
  },
  buttonOverFlow: {
    borderRadius: 100,
    overflow: "hidden",
    width: 38,
    height: 38,
  },
  buttonStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  sendButtonWrapper: {
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: "dodgerblue",
    overflow: "hidden",
  },
  sendButtonStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

export default CustomTextInput;
