import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { Link } from "expo-router";

const Home = () => {
  const [state, setState] = useState({
    albums: [],
    images: [],
  });

  useEffect(() => {
    CameraRoll.getAlbums({}).then((res) => {
      setState((prev) => ({ ...prev, albums: res }));
    });
  }, []);

  const getImageFromAlbum = (albumName, count) => {
    CameraRoll.getPhotos({ first: count, groupName: albumName }).then((res) =>
      setState((prev) => ({ ...prev, images: res.edges }))
    );
  };

  return (
    <ScrollView>
      <Text style={{ fontWeight: "bold" }}>Groups</Text>
      {state.albums?.map((item, index) => (
        <Pressable
          android_ripple={{
            color: "red",
          }}
          key={index.toString()}
          onPress={() => getImageFromAlbum(item.title, item.count)}
        >
          <Text>
            {item.title} {item.count}
          </Text>
        </Pressable>
      ))}
      {/* <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {state.images.map((val, id) => (
          <Image
            key={id.toString()}
            source={{ uri: val.node.image.uri }}
            style={{
              width: Dimensions.get("window").width / 3,
              height: Dimensions.get("window").width / 3,
            }}
          />
        ))}
      </View> */}
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
