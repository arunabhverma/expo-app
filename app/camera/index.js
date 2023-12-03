import React, { useEffect } from "react";
import { View, Button } from "react-native";
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
    <View style={{ flex: 1 }}>
      <View
        style={{
          marginTop: top,
          backgroundColor: "red",
          position: "absolute",
          zIndex: 1,
        }}
      >
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
      <Camera ratio="16:9" style={{ flex: 1 }} type={CameraType.back} />
    </View>
  );
};

export default index;
