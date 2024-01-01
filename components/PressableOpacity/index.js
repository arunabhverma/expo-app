import React from "react";
import { Pressable } from "react-native";

const PressableOpacity = ({ children, borderless, onPress, style }) => {
  return (
    <Pressable
      android_ripple={{
        color: "rgba(0, 0, 0, 0.1)",
      }}
      onPress={onPress}
      style={({ pressed }) => {
        return [style, { opacity: pressed ? 0.8 : 1 }];
      }}
    >
      {children}
    </Pressable>
  );
};

export default PressableOpacity;
