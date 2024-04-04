import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import AwesomeGallery from "react-native-awesome-gallery";
import * as React from "react";
import { Image } from "expo-image";
import * as StatusBar from "expo-status-bar";

const renderItem = ({ item, setImageDimensions }) => {
  return (
    <Image
      source={item.uri}
      style={StyleSheet.absoluteFillObject}
      contentFit="contain"
      placeholder={"LEHV6nWB2yk8pyo0adR*.7kCMdnj"}
      onLoad={(e) => {
        const { width, height } = e.source;
        setImageDimensions({ width, height });
      }}
    />
  );
};

const Photos = () => {
  const { setParams, goBack } = useNavigation();
  const isFocused = useIsFocused();
  const rootParams = useRoute();
  const gallery = useRef(null);

  const params = {
    index: +rootParams.params.index,
    images: rootParams.params.images.split(","),
  };

  const [infoVisible, setInfoVisible] = useState(true);

  React.useEffect(() => {
    StatusBar.setStatusBarTranslucent(true);
    StatusBar.setStatusBarStyle("light");
    StatusBar.setStatusBarBackgroundColor("rgba(0,0,0,0)");
    return () => {
      StatusBar.setStatusBarStyle("dark");
      StatusBar.setStatusBarBackgroundColor("white");
    };
  }, [isFocused]);

  const onIndexChange = useCallback(
    (index) => {
      isFocused && setParams({ index });
    },
    [isFocused, setParams]
  );

  const onTap = () => {
    setInfoVisible(!infoVisible);
  };

  return (
    <View style={styles.container}>
      <AwesomeGallery
        ref={gallery}
        data={params.images.map((uri) => ({ uri }))}
        keyExtractor={(item) => item.uri}
        renderItem={renderItem}
        initialIndex={params.index}
        disableSwipeUp
        hideAdjacentImagesOnScaledImage
        maxScale={4}
        style={{ backgroundColor: "black" }}
        numToRender={3}
        doubleTapInterval={150}
        onIndexChange={onIndexChange}
        onSwipeToClose={goBack}
        onTap={onTap}
        loop={false}
      />
    </View>
  );
};

export default Photos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toolbar: {
    position: "absolute",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  bottomToolBar: {
    bottom: 0,
  },
  headerText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
