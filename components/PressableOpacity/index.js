import React from "react";
import { Pressable } from "react-native";

const PressableOpacity = ({
  children,
  borderless,
  foreground,
  style,
  ...props
}) => {
  return (
    <Pressable
      android_ripple={{
        borderless: typeof borderless === "boolean" ? borderless : false,
        foreground: typeof foreground === "boolean" ? foreground : false,
        color: "rgba(0, 0, 0, 0.1)",
      }}
      style={({ pressed }) => {
        return [style, { opacity: pressed ? 0.8 : 1 }];
      }}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export default PressableOpacity;
