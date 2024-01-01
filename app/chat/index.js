import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TextInput,
  VirtualizedList,
  Keyboard,
  Button,
} from "react-native";
import ChatDATA from "../../mock/chatData";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useKeyboard } from "../../hooks/useKeyboard";
import EmojiKeyboard from "./emojiKeyboard";
import CustomTextInput from "./customTextInput";

const ChatScreen = () => {
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const inputContainerRef = useRef(null);
  const emojiViewHeight = useSharedValue(0);
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
          <Text>{item.msg}</Text>
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
      {/* <Animated.View
        ref={inputContainerRef}
        style={{
          paddingVertical: 10,
          backgroundColor: "red",
        }}
      >
        <TextInput
          ref={inputRef}
          value={state.text}
          onFocus={openKeyboard}
          onChangeText={(e) => setState((prev) => ({ ...prev, text: e }))}
          style={{ height: 100, backgroundColor: "blue" }}
        />
        <Button title={"push"} onPress={sendMsg} />
        {state.emojiView ? (
          <Button title={"Open Keyboard"} onPress={openKeyboard} />
        ) : (
          <Button title={"Open Emoji"} onPress={openEmoji} />
        )}
      </Animated.View> */}
      <Animated.View
        style={[
          {
            width: "100%",
            backgroundColor: "orange",
          },
          state.emojiView ? animatedWrapperTwo : animatedWrapper,
        ]}
      >
        <EmojiKeyboard
          onEmoji={(e) =>
            setState((prev) => ({ ...prev, text: prev.text + e }))
          }
        />
      </Animated.View>
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
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 20,
    gap: 5,
  },
});

export default ChatScreen;
