import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import PressableOpacity from "../PressableOpacity";

const MAX_WIDTH = Dimensions.get("window").width * 0.8;

const RenderImage = ({ item }) => {
  const [state, setState] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    Image.getSize(item.uri, (width, height) => {
      setState((prev) => ({ ...prev, width: width, height: height }));
    });
  }, [item]);

  return (
    <PressableOpacity>
      <Image
        source={{ uri: item.uri }}
        style={{
          width: state.width,
          height: state.height,
        }}
      />
    </PressableOpacity>
  );
};

const RenderMedia = ({ data }) => {
  return (
    <View
      style={{
        margin: 5,
        overflow: "hidden",
        borderRadius: 10,
      }}
    >
      {data.map((item, index) => (
        <RenderImage {...{ item, index }} />
      ))}
    </View>
  );
};

export default RenderMedia;

const styles = StyleSheet.create({});
