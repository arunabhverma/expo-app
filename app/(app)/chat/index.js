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
import _ from "lodash";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import uuid from "react-native-uuid";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { DragDropContentView } from "expo-drag-drop-content-view";
import firestore from "@react-native-firebase/firestore";
import { useKeyboard } from "../../../hooks/useKeyboard";
import EmojiKeyboard from "./emojiKeyboard";
import CustomTextInput from "./customTextInput";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHeaderHeight } from "@react-navigation/elements";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import PressableOpacity from "../../../components/PressableOpacity";
import RenderMedia from "../../../components/RenderMedia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";

const chatCollection = firestore().collection("Chats");
const roomCollection = firestore().collection("Rooms");

const AnimatedVirtualizedList =
  Animated.createAnimatedComponent(VirtualizedList);

const HEIGHT = Dimensions.get("window").height;

const config = {
  duration: 300,
  easing: Easing.out(Easing.exp),
};

const ChatScreen = () => {
  const { user, user_id, keyboardHeight } = useSelector((state) => state.auth);
  const recipient = useLocalSearchParams();
  const recipient_id = recipient?.user_id;

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
    data: [],
    imageData: [],
    emojiView: false,
    keyboardHeight: Platform.OS === "ios" ? 346 : 312,
    room: {},
  });

  useEffect(() => {
    const subscriber = chatCollection.onSnapshot((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        let lastData = documentSnapshot.data()?.data?.pop();
        if (lastData?.user_id !== user_id) {
          setState((prev) => ({
            ...prev,
            data: [lastData, ...prev.data],
          }));
        }
      });
    });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  useEffect(() => {
    getRoomId();
  }, []);

  useEffect(() => {
    if (state.room?.room_id) {
      getRoomChats(state.room?.room_id);
    }
  }, [state.room]);

  const getRoomId = () => {
    if (recipient_id && user_id) {
      let IDs = [recipient_id, user_id];
      roomCollection
        .where("user_ids", "array-contains-any", IDs)
        .get()
        .then((res) => {
          const matchingRooms = res.docs.find((doc) => {
            const docUserIDs = doc.data().user_ids;
            return IDs.every((id) => docUserIDs.includes(id));
          });
          if (
            matchingRooms !== undefined &&
            Object.keys(matchingRooms)?.length > 0
          ) {
            setState((prev) => ({ ...prev, room: matchingRooms.data() }));
          } else {
            let uid = uuid.v4();
            roomCollection
              ?.add({
                room_id: uid,
                user_ids: [recipient_id, user_id],
                users: [user, recipient],
              })
              .then(() => {
                setState((prev) => ({
                  ...prev,
                  room: {
                    room_id: uid,
                    user_ids: [recipient_id, user_id],
                    users: [user, recipient],
                  },
                }));
              });
          }
        })
        .catch((e) => console.log("e", e));
    }
  };

  const getRoomChats = () => {
    chatCollection
      ?.doc(state?.room?.room_id)
      .get()
      .then((res) => {
        let chatData = _.orderBy(res?.data()?.data || [], "createdAt", "desc");
        setState((prev) => ({ ...prev, data: chatData }));
      })
      .catch((e) => console.log("e", e));
  };

  const [lastDocument, setLastDocument] = useState();
  const [userData, setUserData] = useState([]);

  const onEndReached = () => {
    // console.log("LOAD");
    // let query = chatCollection.doc(state?.room?.room_id)
    // // if(state?.data)
    // // console.log(qu);
    // // if (lastDocument !== undefined) {
    // //   query = query.startAfter(lastDocument); // fetch data following the last document accessed
    // // }
    // query
    //   .limit(3) // limit to your page size, 3 is just an example
    //   .get()
    //   .then((querySnapshot) => {
    //     setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
    //     // MakeUserData(querySnapshot.docs);
    //   });
  };
  // if(state.data?.length > 0){

  // }

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
    chatCollection?.doc(state.room?.room_id)?.set(
      {
        data: firestore.FieldValue.arrayUnion({
          user_id: user_id,
          msg: state.text,
          createdAt: firestore.Timestamp.now(),
        }),
      },
      { merge: true }
    );
    setState((prev) => ({
      ...prev,
      data: [{ msg: prev.text, user_id }, ...prev.data],
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
      } else if (event.absoluteY < HEIGHT - keyboardHeight) {
        emojiViewHeight.value = withTiming(-keyboardHeight, config);
      } else if (
        event.absoluteY <
        HEIGHT - (EXPANDABLE_HEIGHT - keyboardHeight) / 3
      ) {
        emojiViewHeight.value = withTiming(-keyboardHeight, config);
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
      [-keyboardHeight, 0],
      [0, bottom],
      Extrapolate.CLAMP
    );
    return {
      height: -keyboardHeight,
      marginTop: newVal,
    };
  }, [bottom, keyboardHeight]);

  const animatedWrapperTwo = useAnimatedStyle(() => {
    let keyboardHeight = emojiViewHeight.value;
    let newVal = interpolate(
      keyboardHeight,
      [-keyboardHeight, 0],
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
      emojiViewHeight.value = withTiming(-keyboardHeight, config);
    }
  };

  const openKeyboard = () => {
    emojiViewHeight.value = withTiming(-keyboardHeight, config);
    inputRef.current.focus();
    setTimeout(() => {
      setState((prev) => ({ ...prev, emojiView: false }));
      emojiViewHeight.value = withTiming(0, config);
    }, 300);
  };

  const renderItem = ({ item, index }) => {
    let isUser = item.user_id === user_id;
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
      {state.data?.length > 0 ? (
        <AnimatedVirtualizedList
          ref={listRef}
          inverted
          data={state.data || []}
          extraData={state.data || []}
          removeClippedSubviews={Platform.OS === "android"}
          getItemCount={getItemCount}
          getItem={getItem}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={16}
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          contentContainerStyle={styles.flatListStyle}
          style={[
            { flex: 1 },
            Platform.OS === "android" && { transform: [{ scale: -1 }] },
          ]}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
        />
      ) : (
        <View style={{ flex: 1 }} />
      )}
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
