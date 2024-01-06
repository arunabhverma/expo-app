import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  VirtualizedList,
  Keyboard,
  Dimensions,
} from "react-native";
import ChatDATA from "../../mock/chatData";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useKeyboard } from "../../hooks/useKeyboard";
import EmojiKeyboard from "./emojiKeyboard";
import CustomTextInput from "./customTextInput";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const ChatScreen = () => {
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const emojiViewHeight = useSharedValue(0);
  const offset = useSharedValue(0);
  const isKeyboardOpen = useKeyboard();

  const { height } = useReanimatedKeyboardAnimation();

  const [state, setState] = useState({
    text: "",
    data: ChatDATA,
    emojiView: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (isKeyboardOpen.open) {
      let val = isKeyboardOpen?.endCoordinates?.height;
      setState((prev) => ({ ...prev, keyboardHeight: val }));
    }
  }, [isKeyboardOpen.open]);

  const getItem = (_data, index) => _data[index];

  const getItemCount = (_data) => _data?.length;

  const sendMsg = () => {
    setState((prev) => ({
      ...prev,
      data: [{ msg: prev.text, uId: 1 }, ...prev.data],
      text: "",
    }));

    listRef.current.scrollToOffset({ offset: 0, animated: false });
  };

  const swipeGesture = Gesture.Pan()
    .onBegin(() => {})
    .onChange((event) => {
      offset.value += event.changeY;
    })
    .onFinalize(() => {});

  const swipeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offset.value }],
    };
  });

  const animatedWrapper = useAnimatedStyle(() => {
    let keyboardHeight = height.value;
    return {
      height: -keyboardHeight,
    };
  }, []);

  const animatedWrapperTwo = useAnimatedStyle(() => {
    let keyboardHeight = emojiViewHeight.value;
    return {
      height: -keyboardHeight,
    };
  }, [state.emojiView, emojiViewHeight.value]);

  const openEmoji = () => {
    if (isKeyboardOpen.open) {
      setState((prev) => ({ ...prev, emojiView: true }));
      Keyboard.dismiss();
      emojiViewHeight.value = height.value;
    } else {
      setState((prev) => ({ ...prev, emojiView: true }));
      emojiViewHeight.value = withTiming(-state.keyboardHeight);
    }
  };

  const openKeyboard = () => {
    inputRef.current.focus();
    setTimeout(() => {
      setState((prev) => ({ ...prev, emojiView: false }));
      emojiViewHeight.value = 0;
    }, 300);
  };

  const renderItem = ({ item }) => {
    let isUser = item.uId === 1;
    return (
      <View style={[styles.msgWrapper, isUser && styles.userMsgWrapper]}>
        <View
          style={[
            styles.msgBubble,
            isUser ? styles.userBubble : styles.otherBubble,
          ]}
        >
          <Text style={styles.msgStyle}>{item.msg}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[{ flex: 1 }]}>
      <VirtualizedList
        ref={listRef}
        inverted
        data={[
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
          ...state.data,
        ]}
        extraData={state.data}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={10}
        getItemCount={getItemCount}
        getItem={getItem}
        maxToRenderPerBatch={5}
        windowSize={16}
        contentContainerStyle={[styles.flatListStyle]}
        style={[{ flex: 1, transform: [{ scale: -1 }] }]}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
      />
      <CustomTextInput
        ref={inputRef}
        onFocus={openKeyboard}
        value={state.text}
        onChangeText={(e) => setState((prev) => ({ ...prev, text: e }))}
        isEmoji={state.emojiView}
        onSend={sendMsg}
        onEmoji={openEmoji}
        onKeyboard={openKeyboard}
      />
      {/* <GestureDetector gesture={swipeGesture}> */}
      <Animated.View
        style={[
          {
            width: "100%",
            backgroundColor: "white",
          },
          state.emojiView ? animatedWrapperTwo : animatedWrapper,
          // swipeAnimatedStyle,
        ]}
      >
        {state.emojiView && (
          <EmojiKeyboard
            keyboardHeight={-emojiViewHeight.value}
            onEmoji={(e) =>
              setState((prev) => ({ ...prev, text: prev.text + e }))
            }
          />
        )}
      </Animated.View>
      {/* </GestureDetector> */}
    </SafeAreaView>
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
    maxWidth: Dimensions.get("window").width * 0.8,
    borderRadius: 15,
    paddingVertical: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
  otherBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: "rgb(230,230,255)",
    borderBottomRightRadius: 0,
  },
  flatListStyle: {
    flexGrow: 1,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 20,
    paddingTop: 20,
    gap: 5,
  },
  msgStyle: {
    fontSize: 17,
  },
});

export default ChatScreen;
