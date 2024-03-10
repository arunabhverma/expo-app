import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  VirtualizedList,
  Keyboard,
  Dimensions,
} from "react-native";
import ChatDATA from "../../mock/chatData";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { DragDropContentView } from "expo-drag-drop-content-view";
import { useKeyboard } from "../../hooks/useKeyboard";
import EmojiKeyboard from "./emojiKeyboard";
import CustomTextInput from "./customTextInput";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHeaderHeight } from "@react-navigation/elements";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import PressableOpacity from "../../components/PressableOpacity";
import RenderMedia from "../../components/RenderMedia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const AnimatedVirtualizedList =
  Animated.createAnimatedComponent(VirtualizedList);

const HEIGHT = Dimensions.get("window").height;

const config = {
  duration: 300,
  easing: Easing.out(Easing.exp),
};

const ChatScreen = () => {
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const { bottom } = useSafeAreaInsets();
  const emojiViewHeight = useSharedValue(0);
  const isKeyboardOpen = useKeyboard();
  const headerHeight = useHeaderHeight();
  const EXPANDABLE_HEIGHT = HEIGHT - (38 + 3 + 14 + headerHeight);
  const HALF_EXPANDABLE_HEIGHT = EXPANDABLE_HEIGHT / 2;

  const { height } = useReanimatedKeyboardAnimation();

  const [state, setState] = useState({
    text: "",
    data: ChatDATA,
    imageData: [],
    emojiView: false,
    keyboardHeight: Platform.OS === "ios" ? 346 : 312,
  });

  useEffect(() => {
    if (isKeyboardOpen.open) {
      let val = isKeyboardOpen?.endCoordinates?.height;
      setState((prev) => ({ ...prev, keyboardHeight: val }));
    }
  }, [isKeyboardOpen.open]);

  const onBackspace = useCallback(
    () =>
      setState((prev) => ({
        ...prev,
        text: Array.from(prev.text).slice(0, -1).join(""),
      })),
    []
  );

  const getItem = (_data, index) => _data[index];

  const getItemCount = (_data) => _data?.length;

  const onEmojiPress = (e) => {
    setState((prev) => ({ ...prev, text: prev.text + e }));
  };

  const sendMsg = (data = []) => {
    setState((prev) => ({
      ...prev,
      data: [{ msg: prev.text, media: data, uId: 1 }, ...prev.data],
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
        emojiViewHeight.value = withTiming(-EXPANDABLE_HEIGHT, config);
      } else if (event.absoluteY < HEIGHT - state.keyboardHeight) {
        emojiViewHeight.value = withTiming(-state.keyboardHeight, config);
      } else if (
        event.absoluteY <
        HEIGHT - (EXPANDABLE_HEIGHT - state.keyboardHeight) / 3
      ) {
        emojiViewHeight.value = withTiming(-state.keyboardHeight, config);
      } else {
        emojiViewHeight.value = withTiming(0, config, () =>
          runOnJS(setState)({ ...state, emojiView: false })
        );
      }
    })
    .onFinalize(() => {});

  const animatedWrapper = useAnimatedStyle(() => {
    let keyboardHeight = height.value;
    let newVal = interpolate(
      keyboardHeight,
      [-state.keyboardHeight, 0],
      [0, bottom],
      Extrapolate.CLAMP
    );
    return {
      height: -keyboardHeight,
      marginTop: newVal,
    };
  }, [bottom, state.keyboardHeight]);

  const animatedWrapperTwo = useAnimatedStyle(() => {
    let keyboardHeight = emojiViewHeight.value;
    let newVal = interpolate(
      keyboardHeight,
      [-state.keyboardHeight, 0],
      [0, bottom],
      Extrapolate.CLAMP
    );
    return {
      height: -keyboardHeight,
      marginTop: newVal,
    };
  }, [state.emojiView, emojiViewHeight.value]);

  const openEmoji = () => {
    if (isKeyboardOpen.open) {
      setState((prev) => ({ ...prev, emojiView: true }));
      Keyboard.dismiss();
      emojiViewHeight.value = height.value;
    } else {
      setState((prev) => ({ ...prev, emojiView: true }));
      emojiViewHeight.value = withTiming(-state.keyboardHeight, config);
    }
  };

  const openKeyboard = () => {
    emojiViewHeight.value = withTiming(-state.keyboardHeight, config);
    inputRef.current.focus();
    setTimeout(() => {
      setState((prev) => ({ ...prev, emojiView: false }));
      emojiViewHeight.value = withTiming(0, config);
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
          {item.media && (
            <RenderMedia
              data={item.media}
              onPressImage={(id) =>
                router.push({
                  pathname: "photoView",
                  params: {
                    index: id,
                    images: item.media.map((val) => val.uri),
                  },
                })
              }
            />
          )}
          {item.msg?.length > 0 && (
            <Text style={styles.msgStyle}>{item.msg}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFill,
          zIndex: 1,
        }}
      >
        <DragDropContentView
          highlightColor="rgba(255,255,255,1)"
          highlightBorderRadius={0}
          onDropEvent={({ assets }) => {
            setState((prev) => ({ ...prev, imageData: assets }));
          }}
          style={{
            flex: 1,
          }}
        />
      </View>
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
        contentContainerStyle={styles.flatListStyle}
        style={[
          { flex: 1 },
          Platform.OS === "android" && { transform: [{ scale: -1 }] },
        ]}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
      />
      <CustomTextInput
        ref={inputRef}
        onFocus={openKeyboard}
        value={state.text}
        dropImagesFromOutside={state.imageData}
        onChangeText={(e) => setState((prev) => ({ ...prev, text: e }))}
        placeholder={"Message"}
        isEmoji={state.emojiView}
        onSend={sendMsg}
        onEmoji={openEmoji}
        onKeyboard={openKeyboard}
      />
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[
            styles.swipeableView,
            state.emojiView ? animatedWrapperTwo : animatedWrapper,
          ]}
        >
          <View style={styles.sheetHandle}>
            <View style={styles.handle} />
          </View>
          <View style={styles.sheetContainer}>
            <PressableOpacity
              borderless={true}
              foreground={true}
              style={styles.backSpaceButton}
              onPress={onBackspace}
            >
              <Ionicons name="backspace" size={24} color="rgba(0, 0, 0, 0.5)" />
            </PressableOpacity>
          </View>
          {state.emojiView && <EmojiKeyboard onEmoji={onEmojiPress} />}
        </Animated.View>
      </GestureDetector>
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
    maxWidth: Dimensions.get("window").width * 0.8,
    borderRadius: 15,

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
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  swipeableView: {
    width: "100%",
    backgroundColor: "white",
    overflow: "hidden",
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
  sheetHandle: {
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  sheetContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginHorizontal: 10,
  },
  backSpaceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
