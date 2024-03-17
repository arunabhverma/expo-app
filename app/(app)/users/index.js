import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { router } from "expo-router";

const Users = () => {
  const { user_id } = useSelector((state) => state.auth);
  const [state, setState] = useState({
    usersList: [],
  });
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    firestore()
      .collection("Users")
      .where("user_id", "!=", user_id)
      .get()
      .then((res) => {
        setState((prev) => ({ ...prev, usersList: res?._docs }));
      })
      .catch((e) => console.log("e"));
  };

  const renderItem = ({ item, index }) => {
    let user = item?._data;
    return (
      <Pressable
        style={styles.userCard}
        onPress={() => router.push({ pathname: "/chat", params: user })}
      >
        <View style={styles.imageBox} />
        <View>
          <Text>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text>{user?.email}</Text>
        </View>
      </Pressable>
    );
  };
  return (
    <FlatList
      data={state.usersList}
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

export default Users;
