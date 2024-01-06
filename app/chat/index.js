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
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useKeyboard } from "../../hooks/useKeyboard";
import EmojiKeyboard from "./emojiKeyboard";
import CustomTextInput from "./customTextInput";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import { useHeaderHeight } from "@react-navigation/elements";
import { StatusBar } from "expo-status-bar";

const AnimatedVirtualizedList =
  Animated.createAnimatedComponent(VirtualizedList);

const HEIGHT = Dimensions.get("window").height;

const ChatScreen = () => {
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const emojiViewHeight = useSharedValue(0);
  const isKeyboardOpen = useKeyboard();
  const headerHeight = useHeaderHeight();
  const EXPANDABLE_HEIGHT = HEIGHT - (38 + 3 + 14 + headerHeight);
  const HALF_EXPANDABLE_HEIGHT = EXPANDABLE_HEIGHT / 2;

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
      if (-emojiViewHeight.value > EXPANDABLE_HEIGHT) {
        emojiViewHeight.value = -EXPANDABLE_HEIGHT;
      } else {
        emojiViewHeight.value += event.changeY;
      }
    })
    .onEnd((event) => {
      if (event.absoluteY < HALF_EXPANDABLE_HEIGHT) {
        emojiViewHeight.value = withTiming(-EXPANDABLE_HEIGHT);
      } else if (event.absoluteY < HEIGHT - state.keyboardHeight) {
        emojiViewHeight.value = withTiming(-state.keyboardHeight);
      } else if (
        event.absoluteY <
        HEIGHT - (EXPANDABLE_HEIGHT - state.keyboardHeight) / 3
      ) {
        emojiViewHeight.value = withTiming(-state.keyboardHeight);
      } else {
        emojiViewHeight.value = withTiming(0, undefined, () =>
          runOnJS(setState)({ ...state, emojiView: false })
        );
      }
    })
    .onFinalize(() => {});

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
    emojiViewHeight.value = withTiming(-state.keyboardHeight);
    inputRef.current.focus();
    setTimeout(() => {
      setState((prev) => ({ ...prev, emojiView: false }));
      emojiViewHeight.value = withTiming(0);
    }, 300);
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
          <Text style={styles.msgStyle}>{item.msg}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[{ flex: 1 }]}>
      <StatusBar style="dark" />
      <AnimatedVirtualizedList
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
        style={{ flex: 1, transform: [{ scale: -1 }] }}
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
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[
            {
              width: "100%",
              backgroundColor: "red",
              overflow: "hidden",
            },
            state.emojiView ? animatedWrapperTwo : animatedWrapper,
          ]}
        >
          <ScrollView style={{ margin: 10, backgroundColor: "white" }}>
            {new Array(100).fill("a").map((item, index) => (
              <Text key={index.toString()}>Hello world!</Text>
            ))}
          </ScrollView>
          {/* <ScrollView style={{ backgroundColor: "red" }}>
            {new Array(100).fill("a").map((item) => (
              <Text>Hello world!</Text>
            ))}
          </ScrollView> */}
          {/* {state.emojiView && (
          <EmojiKeyboard
            keyboardHeight={-emojiViewHeight.value}
            onEmoji={(e) =>
              setState((prev) => ({ ...prev, text: prev.text + e }))
            }
          />
        )} */}
        </Animated.View>
      </GestureDetector>
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
    borderTopLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: "rgb(230,230,255)",
    borderTopRightRadius: 0,
  },
  flatListStyle: {
    flexGrow: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 5,
    gap: 10,
  },
  msgStyle: {
    fontSize: 17,
  },
});

export default ChatScreen;
