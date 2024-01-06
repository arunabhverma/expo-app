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
  Image,
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
import { Camera, CameraType } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  BounceIn,
  BounceOut,
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

const placeholderImage = require("../../assets/icon.png");
const WIDTH = Dimensions.get("window").width;
const ITEM_HEIGHT = WIDTH / 3 - 5;

const CustomButton = ({ children, href, ...props }) => {
  return (
    <Link href={href} asChild>
      <Pressable {...props}>{children}</Pressable>
    </Link>
  );
};

const Home = () => {
  const { top } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef();
  const snapPoints = useMemo(() => ["50%", "100%"], []);

  const [state, setState] = useState({
    imageArray: [],
    selectedImage: [],
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

  const onEndReached = ({ distanceFromEnd }) => {
    if (distanceFromEnd >= 0) {
      setState((prev) => ({
        ...prev,
        imageCount: prev.imageCount + 20,
      }));
    }
  };

  const setSelectedImage = (id) => {
    if (state.selectedImage?.find((val) => val.id === id)) {
      let val = state.selectedImage?.filter((item) => item.id !== id);
      setState((prev) => ({
        ...prev,
        selectedImage: val,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedImage: [
          ...prev.selectedImage,
          {
            id: id,
          },
        ],
      }));
    }
  };

  const RadioButton = ({ val, ...props }) => {
    return (
      <Pressable {...props}>
        <View style={[styles.radioButton, val && styles.activeRadioButton]}>
          {Boolean(val) && <Text style={styles.buttonText}>{val}</Text>}
        </View>
      </Pressable>
    );
  };

  const renderItem = ({ item, index }) => {
    const checkVal = state.selectedImage.indexOf(
      state.selectedImage?.find((val) => val.id === index)
    );
    const val = checkVal > -1 ? checkVal + 1 : 0;

    const href = {
      pathname: "/image",
      params: {
        uri: item.uri,
        name: item.filename.split(".")[0],
      },
    };
    if (index === 0) {
      return (
        <CustomButton href={"/camera"} style={styles.camSpace}>
          <View pointerEvents="none" style={styles.flexOne}>
            <Camera ratio="1:1" style={styles.flexOne} type={CameraType.back} />
          </View>
        </CustomButton>
      );
    }

    return (
      <CustomButton href={href} style={styles.camSpace}>
        <View style={styles.setButton}>
          <RadioButton val={val} onPress={() => setSelectedImage(index)} />
        </View>
        <Image
          key={index.toString()}
          style={[styles.camSpace, styles.fit, val && { margin: 18 }]}
          source={{ uri: item.uri }}
          sharedTransitionTag={item.filename.split(".")[0]}
        />
      </CustomButton>
    );
  };

  const handleComponent = () => {
    return (
      <View style={{}}>
        <Text style={styles.handleText}>
          {state.selectedImage?.length} photos selected
        </Text>
      </View>
    );
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Button
          title={"Select Image"}
          onPress={() => bottomSheetModalRef.current?.present()}
        />
        <StatusBar style="dark" />
        <BottomSheetModal
          index={0}
          topInset={top}
          ref={bottomSheetModalRef}
          handleComponent={
            state.selectedImage?.length > 0 ? handleComponent : undefined
          }
          backdropComponent={renderBackdrop}
          snapPoints={snapPoints}
        >
          <View style={{ flex: 1 }}>
            <BottomSheetFlatList
              data={state.imageArray}
              numColumns={3}
              keyExtractor={(_, i) => i.toString()}
              style={styles.listStyle}
              contentContainerStyle={styles.rowWrapperStyle}
              columnWrapperStyle={styles.columnWrapperStyle}
              onEndReached={onEndReached}
              onEndReachedThreshold={5}
              renderItem={renderItem}
            />
          </View>
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
  listStyle: {
    marginHorizontal: 10,
  },
  rowWrapperStyle: {
    gap: 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  columnWrapperStyle: {
    gap: 5,
  },
  camSpace: {
    flex: 1,
    height: ITEM_HEIGHT,
    backgroundColor: "rgb(240,240,240)",
  },
  flexOne: {
    flex: 1,
  },
  fit: {
    objectFit: "cover",
  },
  radioButton: {
    width: 25,
    height: 25,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  activeRadioButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "white",
  },
  setButton: {
    position: "absolute",
    zIndex: 1,
    right: 5,
    top: 5,
  },
  handleText: {
    paddingTop: 20,
    paddingBottom: 15,
    fontSize: 18,
    paddingHorizontal: 10,
  },
});
