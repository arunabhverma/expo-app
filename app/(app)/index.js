import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import uuid from "react-native-uuid";
import { SplashScreen, router, useNavigation } from "expo-router";
import { setDeviceToken, setUser } from "../../store/authReducer";
import Avatar from "../../components/Avatar";

import notifee, { EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import {
  onAppBootstrap,
  onMessageReceived,
  getPermission,
} from "../../services/notification";
import store from "../../store";
import { formatCreatedAt } from "../../utils";

notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS && detail.pressAction.id) {
    navigate("NotificationScreen");
  }
});
getPermission();
onAppBootstrap()
  .then((token) => store.dispatch(setDeviceToken(token)))
  .catch((_) => {});
// messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);

// SplashScreen.preventAutoHideAsync();

const Rooms = () => {
  const dispatch = useDispatch();
  const { user_id, deviceToken } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const [state, setState] = useState({
    isLoading: false,
    roomsList: [],
    refreshing: false,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "My Chats",
      headerRight: headerRight,
    });
  }, [navigation]);

  useEffect(() => {
    // SplashScreen.hideAsync();
    if (deviceToken && user_id) {
      firestore()
        .collection("fcm-tokens")
        .where("user_id", "==", user_id)
        .get()
        .then((res) => {
          if (res.docs.length > 0) {
            firestore().collection("fcm-tokens").doc(user_id).update({
              fcm_token: deviceToken,
            });
          } else {
            firestore().collection("fcm-tokens").doc(user_id).set({
              id: uuid.v4(),
              user_id: user_id,
              fcm_token: deviceToken,
            });
          }
        });
    }
  }, [deviceToken, user_id]);

  useEffect(() => {
    notifee.setBadgeCount(0);
  }, []);

  useEffect(() => {
    bootstrap()
      .then(() => {})
      .catch((e) => {
        console.log("APP_BOOTSTRAP_ERROR", e);
      });
  }, []);

  useEffect(() => {
    getUserFromUserId();
    getRooms();
  }, []);

  const bootstrap = async () => {
    const initialNotification = await notifee.getInitialNotification();

    if (initialNotification) {
      alert("Notification click");
      // navigate("NotificationScreen");
    }
  };

  const onRefresh = React.useCallback(() => {
    setState((prev) => ({ ...prev, refreshing: true }));
    getRooms();
  }, []);

  const getUserFromUserId = () => {
    firestore()
      .collection("Users")
      .where("user_id", "==", user_id)
      .get()
      .then((res) => {
        dispatch(setUser(res?._docs?.[0]?._data));
      })
      .catch((e) => console.log("e"));
  };

  const getRooms = () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    firestore()
      .collection("Rooms")
      .where("user_ids", "array-contains", user_id)
      .get()
      .then(async (res) => {
        let data = await Promise.all(
          res.docs.map(async (item) => {
            const roomData = item.data();
            const unreadData = await firestore()
              .collection("Unread")
              .doc(roomData.room_id)
              .get()
              .then((val) => val?.data());
            return { ...roomData, unreadData };
          })
        );
        setState((prev) => ({
          ...prev,
          roomsList: data,
          refreshing: false,
          isLoading: false,
        }));
      })
      .catch((e) => {
        setState((prev) => ({ ...prev, isLoading: false }));
        console.log("e", e);
      });
  };
  console.log("state", state.roomsList);
  const headerRight = () => {
    return (
      <Pressable
        android_ripple={{ foreground: true, borderless: true }}
        onPress={() => router.push("/profile")}
      >
        {/* <AntDesign name="plus" size={24} color="black" /> */}
        <Ionicons name="person-circle-outline" size={24} color="black" />
      </Pressable>
    );
  };

  const renderItem = ({ item, index }) => {
    let room = item?.users?.find((item) => item?.user_id !== user_id);
    let unRead = item?.unreadData?.[user_id];
    return (
      <Pressable
        style={styles.userCard}
        onPress={() => router.push({ pathname: "/chat", params: room })}
      >
        <Avatar firstName={room?.first_name} lastName={room?.last_name} />
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text>
              {room?.first_name} {room?.last_name}
            </Text>
            <Text>{formatCreatedAt(unRead?.last_chat?.createdAt)}</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text numberOfLines={1}>
              {unRead?.last_chat?.msg || room?.email}
            </Text>
            {unRead?.count > 0 && (
              <View
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "red",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white" }}>{unRead?.count || 0}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const ListEmptyComponent = useCallback(() => {
    if (state.isLoading && state.roomsList?.length === 0) {
      return (
        <View style={{ paddingTop: 20 }}>
          <ActivityIndicator size={"large"} />
        </View>
      );
    }
  }, [state.isLoading, state.roomsList]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={state.roomsList}
        contentContainerStyle={styles.flatListContainerStyle}
        ListEmptyComponent={ListEmptyComponent}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />
        }
      />
      <View
        style={{
          ...StyleSheet.absoluteFill,
          pointerEvents: "box-none",
        }}
      >
        <Pressable
          style={{
            bottom: 20,
            right: 20,
            position: "absolute",
            width: 70,
            height: 70,
            backgroundColor: "dodgerblue",
            borderRadius: 70,
            justifyContent: "center",
            alignItems: "center",
          }}
          android_ripple={{ foreground: false, borderless: true }}
          onPress={() => router.push("/users")}
        >
          <Ionicons name="person-add" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flatListContainerStyle: {
    gap: 1,
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
});

export default Rooms;
