import React, { useState, useRef, useCallback } from "react";
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
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import Animated, {
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import ChatDATA from "../../mock/chatData";
import { EMOJI_DATA, CategoryTranslation } from "../../mock/emojiData";

const HEIGHT = Dimensions.get("window").height;

const ChatScreen = () => {
  const { top } = useSafeAreaInsets();
  const scrollRef = useRef();
  const inputRef = useRef();
  const bottomSheetModalRef = useRef();
  const animatedPosition = useSharedValue(HEIGHT);
  const keyboard = useAnimatedKeyboard();
  const isKeyboardOpen = keyboard.state.value === 2;
  const [state, setState] = useState({
    text: "",
    data: ChatDATA,
    keyboardHeight: Platform.OS === "android" ? 288 : 335,
    isSheetOpen: false,
    isAnim: true,
    isEmoji: true,
  });

  const [keyboardHeight, setKeyboardHeight] = useState(
    Platform.OS === "android" ? 288 : 335
  );

  useDerivedValue(() => {
    if (keyboard.state.value === 2) {
      runOnJS(setKeyboardHeight)(keyboard?.height?.value);
    }
  }, [state, keyboard.height.value, keyboard.state.value]);

  const snapPoints = [keyboardHeight, "100%"];

  const translateStyle = useAnimatedStyle(() => {
    let sheetAnimValue = HEIGHT - animatedPosition.value;
    let animVal = sheetAnimValue;
    // let animVal = keyboard.height.value;
    return {
      transform: [{ translateY: -animVal }],
    };
  });

  const flatListAnimatedStyle = useAnimatedStyle(() => {
    let sheetAnimValue = HEIGHT - animatedPosition.value;
    let animVal = sheetAnimValue;
    // let animVal = keyboard.height.value;

    return {
      marginBottom: animVal,
    };
  });

  const sendMsg = () => {
    if (state.text?.trim()?.length > 0) {
      let data = {
        uId: 1,
        msg: state.text,
      };
      setState((prev) => ({ ...prev, text: "", data: [...prev.data, data] }));
      scrollRef.current.scrollToIndex({
        index: state.data?.length - 1,
        animated: true,
      });
    }
  };

  const openEmojiSheet = () => {
    setState((prev) => ({ ...prev, isEmoji: false }));
    bottomSheetModalRef.current.present();
    Keyboard.dismiss();
  };

  const openKeyboard = () => {
    setState((prev) => ({ ...prev, isEmoji: true }));
    inputRef.current.focus();
  };

  const onDismiss = () => {
    setState((prev) => ({ ...prev, isEmoji: true }));
  };

  const onFocus = () => {
    if (!state.isSheetOpen) {
      bottomSheetModalRef.current.present();
    }
    if (state.isSheetOpen && !isKeyboardOpen) {
      setState((prev) => ({ ...prev, isEmoji: true }));
    }
  };

  const onBlur = () => {
    if (isKeyboardOpen && state.isSheetOpen && !state.isEmoji) {
    } else {
      bottomSheetModalRef.current.dismiss();
    }
  };

  const RenderSingleEmoji = useCallback(({ item, index, setEmoji }) => {
    return (
      <Pressable
        key={index.toString()}
        onPressIn={() => setEmoji(item.emoji)}
        android_ripple={{
          color: "rgba(0, 0, 0, 0.1)",
          foreground: true,
          borderless: false,
        }}
        style={{
          width: Dimensions.get("window").width / 9,
          height: Dimensions.get("window").width / 9,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 25 }}>{item.emoji}</Text>
      </Pressable>
    );
  }, []);

  const RenderEmoji = useCallback(({ item: { title, data }, setEmoji }) => {
    return (
      <View>
        <Text>{CategoryTranslation[title]}</Text>
        <FlatList
          data={data}
          numColumns={9}
          removeClippedSubviews={Platform.OS === "android"}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={16}
          keyExtractor={(_, i) => i.toString()}
          renderItem={(props) => (
            <RenderSingleEmoji {...props} setEmoji={setEmoji} />
          )}
        />
      </View>
    );
  }, []);

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
        style={[{ flex: 1 }, flatListAnimatedStyle]}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
      />
      <Animated.View style={translateStyle}>
        <SafeAreaView style={{ backgroundColor: "white" }}>
          <View style={styles.inputWrapper}>
            {state.isEmoji ? (
              <Pressable
                style={{ backgroundColor: "transparent", padding: 5 }}
                onPress={() => openEmojiSheet(state.isEmoji)}
              >
                <Entypo name="emoji-flirt" size={24} color="dimgrey" />
              </Pressable>
            ) : (
              <Pressable
                style={{ backgroundColor: "transparent", padding: 5 }}
                onPress={() => openKeyboard(state.isEmoji)}
              >
                <Entypo name="keyboard" size={24} color="dimgrey" />
              </Pressable>
            )}
            <TextInput
              ref={inputRef}
              placeholder="Message"
              onFocus={onFocus}
              onBlur={onBlur}
              value={state.text}
              onSubmitEditing={() => {
                sendMsg();
                bottomSheetModalRef.current.dismiss();
              }}
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
          enablePanDownToClose
          handleIndicatorStyle={[
            isKeyboardOpen || state.isSheetOpen || !state.isEmoji
              ? { backgroundColor: "rgba(0, 0, 0, 0.1)" }
              : { backgroundColor: "transparent" },
          ]}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              isSheetOpen: e >= 0 ? true : false,
            }))
          }
          onDismiss={onDismiss}
          snapPoints={snapPoints}
        >
          <BottomSheetFlatList
            data={EMOJI_DATA}
            removeClippedSubviews={Platform.OS === "android"}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            keyExtractor={(_, i) => i.toString()}
            renderItem={(props) => (
              <RenderEmoji
                {...props}
                setEmoji={(e) =>
                  setState((prev) => ({ ...prev, text: prev.text + e }))
                }
              />
            )}
          />
        </BottomSheetModal>
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
