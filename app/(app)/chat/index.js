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
import { Image as ImageCompressor } from "react-native-compressor";
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
import storage from "@react-native-firebase/storage";
import { useKeyboard } from "../../../hooks/useKeyboard";
import EmojiKeyboard from "./emojiKeyboard";
import CustomTextInput from "./customTextInput";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";
import PressableOpacity from "../../../components/PressableOpacity";
import RenderMedia from "../../../components/RenderMedia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import Avatar from "../../../components/Avatar";
import { fireNotification } from "../../../services/fireNotifications";
import { formatCreatedAt } from "../../../utils";

const chatCollection = (room_id) =>
  firestore().collection("Chats").doc(room_id).collection("chat");
const roomCollection = firestore().collection("Rooms");
const updateRoomCollection = (room_id) =>
  firestore().collection("Rooms").doc(room_id);

const AnimatedVirtualizedList =
  Animated.createAnimatedComponent(VirtualizedList);

const HEIGHT = Dimensions.get("window").height;
const LIMIT = 15;

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
    isDataFetched: null,
    imageData: [],
    emojiView: false,
    keyboardHeight: Platform.OS === "ios" ? 346 : 312,
    room: {},
  });

  useEffect(() => {
    getRoomId();
  }, [state.room?.room_id]);

  useEffect(() => {
    let roomUpdate = {};
    roomUpdate[`${user_id}.count`] = 0;
    if (state.room?.room_id) {
      return () => {
        updateRoomCollection(state?.room?.room_id).update(roomUpdate);
      };
    }
  }, [state.room?.room_id]);

  useEffect(() => {
    if (state.room?.room_id && user_id && state.isDataFetched) {
      const subscriber = chatCollection(state?.room?.room_id)
        .orderBy("createdAt", "desc")
        .where("createdAt", ">", state.isDataFetched)
        .onSnapshot((querySnapshot) => {
          let data = querySnapshot.docs.shift();
          if (
            data?.data()?.user_id !== user_id &&
            data?.data()?.user_id !== undefined
          ) {
            setState((prev) => ({ ...prev, data: [data, ...prev.data] }));
          }
        });

      return () => subscriber();
    }
  }, [state.room, user_id, state.isDataFetched]);

  useEffect(() => {
    if (state.room?.room_id) {
      getRoomChats(state.room?.room_id);
      setOnline();
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
              .doc(uid)
              ?.set({
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

  const getRoomChats = async () => {
    let query = chatCollection(state?.room?.room_id);

    if (state?.data?.[state?.data?.length - 1] !== undefined) {
      const lastDoc = state?.data?.[state?.data?.length - 1];
      query = query.orderBy("createdAt", "desc").startAfter(lastDoc);
    } else {
      query = query.orderBy("createdAt", "desc");
    }

    query
      .limit(LIMIT)
      .get()
      .then((res) => {
        setState((prev) => ({
          ...prev,
          data: [...prev.data, ...res?.docs],
          isDataFetched: new Date().toISOString(),
        }));
      })
      .catch((e) => console.log("e", e));
  };

  const setOnline = () => {};

  const onEndReached = (e) => {
    getRoomChats();
  };

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

  const uploadImage = (imageData) => {
    if (imageData.length === 0) {
      return Promise.resolve([]);
    }

    const imagePromises = [];

    for (let i = 0; i < imageData.length; i++) {
      let image = imageData[i];
      const uploadUri =
        Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri;
      imagePromises.push(
        new Promise((resolve, reject) => {
          storage()
            .ref(`images/${uuid.v4()}_${image?.fileName}`)
            .putFile(uploadUri)
            .then((snapshot) => {
              resolve(snapshot);
            })
            .catch((error) => {
              reject(error);
            });
        })
      );
    }

    return Promise.all(imagePromises);
  };

  const compressor = (imageData) => {
    if (imageData.length === 0) {
      return Promise.resolve([]);
    }

    const imagePromises = [];

    for (let i = 0; i < imageData.length; i++) {
      let image = imageData[i];
      const uploadUri =
        Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri;
      imagePromises.push(
        new Promise((resolve, reject) => {
          ImageCompressor.compress(uploadUri)
            .then((snapshot) => {
              resolve({ ...image, uri: snapshot });
            })
            .catch((error) => {
              reject(error);
            });
        })
      );
    }

    return Promise.all(imagePromises);
  };

  const sendMsg = async (data = []) => {
    let newId = uuid.v4();

    let localMediaArray = data?.length > 0 ? { media: data } : {};
    setState((prev) => ({
      ...prev,
      data: [
        {
          _data: {
            id: newId,
            msg: prev.text,
            user_id,
            ...localMediaArray,
          },
        },
        ...prev.data,
      ],
      text: "",
    }));
    let compressed = await compressor(data);
    let res = await uploadImage(compressed);
    let mediaArray = res.map((item) => {
      if (item.metadata !== undefined) {
        return {
          uri: `https://firebasestorage.googleapis.com/v0/b/${
            item?.metadata?.bucket
          }/o/${encodeURIComponent(item?.metadata?.fullPath)}?alt=media`,
        };
      } else {
        return item;
      }
    });
    let post_data = {
      id: newId,
      user_id: user_id,
      msg: state.text,
      createdAt: new Date().toISOString(),
    };
    if (mediaArray.length > 0) {
      post_data.media = mediaArray;
    }
    chatCollection(state?.room?.room_id).add(post_data);

    updateRoomCollection(state?.room?.room_id)
      .get()
      .then((res) => {
        updateRoomCollection(state?.room?.room_id).update({
          [recipient_id]: {
            count: (res?.data()?.[recipient_id]?.count || 0) + 1,
            last_chat: post_data,
          },
        });
      });

    fireNotification({
      msg: state.text,
      recipient: recipient,
      user_id: user_id,
      image: mediaArray,
    });
    listRef?.current?.scrollToOffset?.({ offset: 0, animated: false });
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

  const renderItem = ({ item }) => {
    let doc = item?._data;
    let isUser = doc?.user_id === user_id;
    return (
      <View style={[styles.msgWrapper, isUser && styles.userMsgWrapper]}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          {!isUser && (
            <Avatar
              variant={"small"}
              firstName={recipient?.first_name}
              lastName={recipient?.last_name}
            />
          )}
          <View
            style={{
              justifyContent: "center",
              alignItems: isUser ? "flex-end" : "flex-start",
            }}
          >
            <View
              style={[
                styles.msgBubble,
                isUser ? styles.userBubble : styles.otherBubble,
              ]}
            >
              {doc?.media && (
                <RenderMedia
                  data={doc.media}
                  onPressImage={(id) =>
                    router.push({
                      pathname: "photoView",
                      params: {
                        index: id,
                        images: doc.media.map((val) => val.uri),
                      },
                    })
                  }
                />
              )}
              {doc?.msg?.length > 0 && (
                <Text style={styles.msgStyle}>{doc?.msg}</Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 11,
                justifyContent: "flex-end",
                alignSelf: "flex-end",
              }}
            >
              {formatCreatedAt(doc?.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
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
          onEndReachedThreshold={0.2}
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
        disabled={state.text.trim().length === 0}
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
