import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TextInput,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import DATA from "../../mock/chatData";

const HEIGHT = Dimensions.get("window").height;

const ChatScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const scrollRef = useRef();
  const inputRef = useRef();
  const bottomSheetModalRef = useRef();
  const animatedPosition = useSharedValue(0);
  const keyboard = useAnimatedKeyboard();
  const [state, setState] = useState({
    text: "",
    data: DATA,
    keyboardHeight: Platform.OS === "android" ? 288 : 335,
    isSheetOpen: false,
    isAnim: true,
  });

  useEffect(() => {
    if (keyboard?.height?.value) {
      setState((prev) => ({
        ...prev,
        keyboardHeight: keyboard?.height?.value,
      }));
    }
  }, [keyboard.height.value]);

  const snapPoints = useMemo(
    () => [state.keyboardHeight, "100%"],
    [state.keyboardHeight]
  );

  const translateStyle = useAnimatedStyle(() => {
    let sheetAnimValue = HEIGHT - animatedPosition.value;
    let animVal = state.isSheetOpen ? sheetAnimValue : keyboard.height.value;
    return {
      transform: [{ translateY: -animVal }],
    };
  });

  const noAnimTranslateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: withSpring(-state.keyboardHeight) }],
    };
  }, [state.keyboardHeight]);

  const noAnimFlatListAnimatedStyle = useAnimatedStyle(() => {
    return {
      marginBottom: withSpring(state.keyboardHeight),
    };
  }, [state.keyboardHeight]);

  const flatListAnimatedStyle = useAnimatedStyle(() => {
    let sheetAnimValue = HEIGHT - animatedPosition.value;
    let animVal = state.isSheetOpen ? sheetAnimValue : keyboard.height.value;

    return {
      marginBottom: animVal,
    };
  });

  const sendMsg = () => {
    let data = {
      uId: 1,
      msg: state.text,
    };
    setState((prev) => ({ ...prev, text: "", data: [...prev.data, data] }));
    scrollRef.current.scrollToIndex({
      index: state.data?.length - 1,
      animated: true,
    });
  };

  const openEmojiSheet = () => {
    let isKeyboardOpen = keyboard.state.value === 2;
    if (isKeyboardOpen) {
      setState((prev) => ({ ...prev, isAnim: false, isSheetOpen: true }));
      bottomSheetModalRef.current?.present();
      // Keyboard.dismiss();
      setTimeout(() => Keyboard.dismiss(), 450);
      setTimeout(() => setState((prev) => ({ ...prev, isAnim: true })), 450);
    }
    if (state.isSheetOpen && state.isAnim === true) {
      setState((prev) => ({ ...prev, isAnim: false }));
      inputRef.current.focus();
      setState((prev) => ({ ...prev, isSheetOpen: false }));
      setTimeout(() => bottomSheetModalRef.current.dismiss(), 450);
    }
    if (!isKeyboardOpen && !state.isSheetOpen) {
      setState((prev) => ({
        ...prev,
        isSheetOpen: true,
      }));
      bottomSheetModalRef.current.present();
    }
  };

  const onFocus = () => {
    if (state.isSheetOpen && state.isAnim === true) {
      setState((prev) => ({ ...prev, isAnim: false }));
      inputRef.current.focus();
      setState((prev) => ({ ...prev, isSheetOpen: false }));
      setTimeout(() => bottomSheetModalRef.current.dismiss(), 450);
    }
  };

  const onBlur = () => {
    let isKeyboardOpen = keyboard.state.value === 2;
    if (isKeyboardOpen && state.isAnim === false) {
      setState((prev) => ({ ...prev, isAnim: true }));
    }
  };

  const renderItem = ({ item, index }) => {
    let isUser = item.uId === 1;
    return (
      <View style={[styles.msgWrapper, isUser && styles.userMsgWrapper]}>
        <View
          style={[
            styles.msgBubble,
            isUser ? styles.userBubble : styles.otherBubble,
          ]}
        >
          <Text>{item.msg}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[{ flex: 1 }]}>
      <Animated.FlatList
        ref={scrollRef}
        inverted
        data={state.data}
        contentContainerStyle={[
          styles.flatListStyle,
          Platform.OS === "android" && { transform: [{ scaleX: -1 }] },
        ]}
        style={[
          { flex: 1 },
          state.isAnim ? flatListAnimatedStyle : noAnimFlatListAnimatedStyle,
        ]}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
      />
      <Animated.View
        style={[state.isAnim ? translateStyle : noAnimTranslateStyle]}
      >
        <SafeAreaView style={{ backgroundColor: "white" }}>
          <View style={styles.inputWrapper}>
            <Pressable
              style={{ backgroundColor: "transparent", padding: 5 }}
              onPress={() => openEmojiSheet()}
            >
              {state.isSheetOpen ? (
                <Entypo name="keyboard" size={24} color="dimgrey" />
              ) : (
                <Entypo name="emoji-flirt" size={24} color="dimgrey" />
              )}
            </Pressable>
            <TextInput
              ref={inputRef}
              placeholder="Message"
              // showSoftInputOnFocus={true}
              onFocus={onFocus}
              onBlur={onBlur}
              value={state.text}
              onSubmitEditing={() => sendMsg()}
              onChangeText={(e) => setState((prev) => ({ ...prev, text: e }))}
              style={styles.textInput}
            />
            {state.text?.trim()?.length > 0 && (
              <Pressable
                style={{ backgroundColor: "transparent", padding: 5 }}
                onPress={() => sendMsg()}
              >
                <Feather name="send" size={24} color="royalblue" />
              </Pressable>
            )}
          </View>
        </SafeAreaView>
        <BottomSheetModal
          topInset={top}
          ref={bottomSheetModalRef}
          animatedPosition={animatedPosition}
          onDismiss={() => {
            setState((prev) => ({ ...prev, isSheetOpen: false }));
          }}
          snapPoints={snapPoints}
        ></BottomSheetModal>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  msgWrapper: {
    alignItems: "flex-start",
  },
  userMsgWrapper: {
    alignItems: "flex-end",
  },
  msgBubble: {
    maxWidth: "70%",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  otherBubble: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderBottomLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    borderBottomRightRadius: 0,
  },
  flatListStyle: {
    flexGrow: 1,
    flexDirection: "column-reverse",
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 20,
    gap: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 10,
    paddingLeft: 15,
    borderRadius: 15,
    fontSize: 18,
  },
});

export default ChatScreen;
