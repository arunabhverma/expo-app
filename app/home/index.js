import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Button,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Camera, CameraType } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

const placeholderImage = require("../../assets/icon.png");
const WIDTH = Dimensions.get("window").width;
const ITEM_HEIGHT = WIDTH / 3 - 5;

const Home = () => {
  const { top } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef();
  const snapPoints = useMemo(() => ["50%"], []);

  const [state, setState] = useState({
    imageArray: [],
    imageCount: 20,
    contentHeight: 0,
  });

  const [permission, requestCameraPermission] = Camera.useCameraPermissions();
  const [permissionResponse, requestMediaPermission] =
    MediaLibrary.usePermissions();

  useEffect(() => {
    requestCameraPermission();
    requestMediaPermission();
  }, []);

  useEffect(() => {
    getImage();
  }, [state.imageCount]);

  const getImage = async () => {
    MediaLibrary.getAssetsAsync({ first: state.imageCount }).then((res) => {
      setState((prev) => ({ ...prev, imageArray: [...res?.assets] }));
    });
  };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Text>Test app 3</Text>
        <Button
          title={"Select Image"}
          onPress={() => bottomSheetModalRef.current?.present()}
        />
        <StatusBar style="auto" />
        <BottomSheetModal
          index={0}
          ref={bottomSheetModalRef}
          topInset={top}
          backdropComponent={renderBackdrop}
          enableDynamicSizing
          snapPoints={snapPoints}
        >
          <BottomSheetFlatList
            data={state.imageArray}
            numColumns={3}
            keyExtractor={(_, i) => i.toString()}
            style={{
              marginHorizontal: 10,
            }}
            contentContainerStyle={{
              gap: 5,
              borderRadius: 10,
              overflow: "hidden",
            }}
            columnWrapperStyle={{ gap: 5 }}
            onEndReached={({ distanceFromEnd }) => {
              if (distanceFromEnd >= 0) {
                setState((prev) => ({
                  ...prev,
                  imageCount: prev.imageCount + 20,
                }));
              }
            }}
            onEndReachedThreshold={5}
            renderItem={({ item, index }) => {
              if (index === 0) {
                return (
                  <Link
                    href={{
                      pathname: "/camera",
                      params: { uri: item.uri },
                    }}
                    asChild
                  >
                    <Pressable
                      style={{ width: ITEM_HEIGHT, height: ITEM_HEIGHT }}
                    >
                      <Camera
                        ratio="1:1"
                        style={{ width: ITEM_HEIGHT, height: "auto" }}
                        type={CameraType.back}
                      />
                    </Pressable>
                  </Link>
                );
              }
              return (
                <Link
                  href={{
                    pathname: "/camera",
                    params: {
                      uri: item.uri,
                      name: item.filename.split(".")[0],
                    },
                  }}
                  asChild
                >
                  <Pressable
                    style={{ width: ITEM_HEIGHT, height: ITEM_HEIGHT }}
                  >
                    <Animated.Image
                      key={index.toString()}
                      style={{
                        width: ITEM_HEIGHT,
                        height: ITEM_HEIGHT,
                        objectFit: "cover",
                      }}
                      source={{ uri: item.uri }}
                      sharedTransitionTag={item.filename.split(".")[0]}
                    />
                  </Pressable>
                </Link>
              );
            }}
          />
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
