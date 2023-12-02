import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import Animated from "react-native-reanimated";

const index = () => {
  const { uri, name } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <Animated.Image
        key={index.toString()}
        style={{
          flex: 1,
          objectFit: "cover",
        }}
        source={{ uri: uri }}
        sharedTransitionTag={name}
      />
    </View>
  );
};

export default index;
