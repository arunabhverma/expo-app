import React, { useState } from "react";
import { View, Image, Button, Dimensions } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const index = () => {
  const [state, setState] = useState({
    width: 0,
    height: 0,
  });
  const { uri } = useLocalSearchParams();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  Image.getSize(uri, (width, height) => {
    let ratio = Dimensions.get("screen").width / width;
    let newHeight = height * ratio;
    setState((prev) => ({
      ...prev,
      width: Dimensions.get("screen").width,
      height: newHeight,
    }));
  });

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          marginTop: top,
          backgroundColor: "black",
          position: "absolute",
          zIndex: 1,
        }}
      >
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
      <Image
        key={index.toString()}
        style={{
          width: state.width,
          height: state.height,
          objectFit: "cover",
        }}
        source={{ uri: uri }}
      />
    </View>
  );
};

export default index;
