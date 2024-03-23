import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import Avatar from "../../../components/Avatar";

const Users = () => {
  const { user_id } = useSelector((state) => state.auth);
  const [state, setState] = useState({
    usersList: [],
    refreshing: false,
  });

  useEffect(() => {
    getUsers();
  }, []);

  const onRefresh = React.useCallback(() => {
    setState((prev) => ({ ...prev, refreshing: true }));
    getUsers();
  }, []);

  const getUsers = () => {
    firestore()
      .collection("Users")
      .where("user_id", "!=", user_id)
      .get()
      .then((res) => {
        setState((prev) => ({
          ...prev,
          usersList: res?._docs,
          refreshing: false,
        }));
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
        <Avatar firstName={user?.first_name} lastName={user?.last_name} />
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
      refreshControl={
        <RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />
      }
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
});

export default Users;
