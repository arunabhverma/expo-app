import React, { useEffect } from "react";
import { View, Button, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import { Camera, CameraType } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const index = () => {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    getRatio();
  }, []);

  const getRatio = async () => {};

  return (
    <View style={styles.flexOne}>
      <View style={[styles.buttonContainer, { marginTop: top }]}>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
      <Camera ratio="16:9" style={styles.flexOne} type={CameraType.back} />
    </View>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  buttonContainer: {
    backgroundColor: "red",
    position: "absolute",
    zIndex: 1,
  },
});

export default index;
