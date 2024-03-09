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
import { Link, router } from "expo-router";

const Home = () => {
  const [state, setState] = useState({
    albums: [],
    images: [],
  });

  useEffect(() => {
    CameraRoll.getAlbums({}).then((res) => {
      console.log("res", res);
      setState((prev) => ({ ...prev, albums: res }));
    });

    CameraRoll.getPhotos({
      first: 20,
      assetType: "Photos",
    }).then((res) => {
      setState((prev) => ({ ...prev, images: res.edges }));
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
          onPress={() => {
            alert("hel");
            getImageFromAlbum(item.title, item.count).then((res) =>
              console.log("res", res)
            );
          }}
        >
          <Text>
            {item.title} {item.count}
          </Text>
        </Pressable>
      ))}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {state.images.map((val, id) => (
          <Pressable
            key={id.toString()}
            onPress={() => {
              router.push({
                pathname: "photoView",
                params: {
                  index: id,
                  images: state.images.map((item) => item.node.image.uri),
                },
              });
            }}
          >
            <Image
              source={{ uri: val.node.image.uri }}
              style={{
                width: Dimensions.get("window").width / 3,
                height: Dimensions.get("window").width / 3,
              }}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
