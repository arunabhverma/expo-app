import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Avatar = ({ variant, firstName = "", lastName = "", image }) => {
  let width = 50;
  if (variant === "small") {
    width = 40;
  }
  return (
    <View style={[styles.imageBox, { width }]}>
      <Text style={styles.name}>
        {firstName?.charAt(0)?.toUpperCase()}
        {lastName?.charAt(0)?.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  imageBox: {
    aspectRatio: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
  },
});
export default Avatar;
