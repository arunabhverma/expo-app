import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import PressableOpacity from "../../../../components/PressableOpacity";
import PasteInput from "@mattermost/react-native-paste-input";
import DataStrap from "../../../../components/DataStrap";
import { router } from "expo-router";

const CustomTextInput = React.forwardRef((props, ref) => {
  const imageScroll = useRef(null);
  const [state, setState] = useState({
    imageData: [],
    isOpen: false,
    openImageIndex: null,
  });

  const disabled = props.disabled && state.imageData.length === 0;

  useEffect(() => {
    onPasteImage(false, props.dropImagesFromOutside);
  }, [props.dropImagesFromOutside]);

  const onPasteImage = (error, data) => {
    if (error) {
      Alert.alert("Error", "Try again!");
    } else {
      setState((prev) => ({ ...prev, imageData: prev.imageData.concat(data) }));
      imageScroll?.current?.scrollToOffset?.({
        offset: 90 * state.imageData?.length - 1,
        animated: true,
      });
    }
  };

  const onDeleteImage = (id) => {
    setState((prev) => ({
      ...prev,
      imageData: prev.imageData.filter((_, i) => i !== id),
    }));
    imageScroll?.current?.scrollToOffset?.({
      offset: 90 * state.imageData?.length - 1,
    });
  };

  const onSendPress = () => {
    setState((prev) => ({ ...prev, imageData: [] }));
    props.onSend(state.imageData);
  };

  return (
    <>
      <DataStrap
        ref={imageScroll}
        isVisible={state.imageData.length > 0}
        imageData={state.imageData}
        onOpenImage={(id) => {
          setState((prev) => ({ ...prev, openImageIndex: id, isOpen: true }));
          router.push({
            pathname: "photoView",
            params: {
              index: id,
              images: state.imageData.map((item) => item.uri),
            },
          });
        }}
        onDelete={onDeleteImage}
      />
      <View style={styles.mainContainer}>
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
          <PasteInput
            ref={ref}
            value={props.value}
            multiline
            onFocus={props.onFocus}
            onChangeText={props.onChangeText}
            style={styles.inputStyle}
            onPaste={onPasteImage}
            {...props}
          />
        </View>
        <View
          style={[
            styles.sendButtonWrapper,
            disabled && { backgroundColor: "#66b4ff" },
          ]}
        >
          <PressableOpacity
            disabled={disabled}
            style={styles.sendButtonStyle}
            onPress={onSendPress}
          >
            <Feather name="send" size={20} color="white" />
          </PressableOpacity>
        </View>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    marginHorizontal: 5,
    marginVertical: 7,
    alignItems: "flex-end",
    gap: 5,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
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
    padding: Platform.OS === "ios" ? 7 : 0,
    fontSize: 20,
    maxHeight: 135,
  },
  buttonOverFlow: {
    marginTop: "auto",
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
    width: 45,
    borderRadius: 100,
    backgroundColor: "dodgerblue",
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
  sendButtonStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

export default CustomTextInput;
