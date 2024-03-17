import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router, useNavigation } from "expo-router";
import { setUser } from "../../store/authReducer";

const Rooms = () => {
  const dispatch = useDispatch();
  const { user_id } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const [state, setState] = useState({
    roomsList: [],
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "My Chats",
      headerRight: headerRight,
    });
  }, [navigation]);

  useEffect(() => {
    getUserFromUserId();
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
    firestore()
      .collection("Rooms")
      .where("user_ids", "array-contains", user_id)
      .get()
      .then((res) => {
        setState((prev) => ({ ...prev, roomsList: res?._docs }));
      })
      .catch((e) => console.log("e"));
  };

  const headerRight = () => {
    return (
      <Pressable
        android_ripple={{ foreground: true, borderless: true }}
        onPress={() => router.push("/users")}
      >
        <AntDesign name="plus" size={24} color="black" />
      </Pressable>
    );
  };

  const renderItem = ({ item, index }) => {
    let room = item?._data?.users?.find((item) => item?.user_id !== user_id);
    return (
      <Pressable
        style={styles.userCard}
        onPress={() => router.push({ pathname: "/chat", params: room })}
      >
        <View style={styles.imageBox} />
        <View>
          <Text>
            {room?.first_name} {room?.last_name}
          </Text>
          <Text>{room?.email}</Text>
        </View>
      </Pressable>
    );
  };
  return (
    <FlatList
      data={state.roomsList}
      contentContainerStyle={styles.flatListContainerStyle}
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderItem}
    />
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
  imageBox: {
    width: 50,
    aspectRatio: 1,
    backgroundColor: "rgb(245, 245, 245)",
    borderRadius: 50 / 2,
  },
});

export default Rooms;
