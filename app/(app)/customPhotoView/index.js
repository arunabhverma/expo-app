import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AwesomeGallery from "react-native-awesome-gallery";
import * as React from "react";
import { Image } from "expo-image";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

const renderItem = ({ item, setImageDimensions }) => {
  return (
    <Image
      source={item.uri}
      style={StyleSheet.absoluteFillObject}
      contentFit="contain"
      onLoad={(e) => {
        const { width, height } = e.source;
        setImageDimensions({ width, height });
      }}
    />
  );
};

const Photos = () => {
  const headerHeight = useHeaderHeight();

  const { top, bottom } = useSafeAreaInsets();
  const { setParams, goBack, setOptions } = useNavigation();
  const isFocused = useIsFocused();
  const rootParams = useRoute();
  const gallery = useRef(null);
  const [mounted, setMounted] = useState(false);

  const params = {
    index: +rootParams.params.index,
    images: rootParams.params.images.split(","),
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const [infoVisible, setInfoVisible] = useState(true);

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
      {infoVisible && (
        <Animated.View
          entering={mounted ? FadeInUp.duration(250) : undefined}
          exiting={FadeOutUp.duration(250)}
          style={[
            styles.toolbar,
            {
              height: top + 60,
              paddingTop: top,
              marginTop: headerHeight,
            },
          ]}
        >
          <View style={styles.textContainer}>
            <Text style={styles.headerText}>
              {params.index + 1} of {params.images.length}
            </Text>
          </View>
        </Animated.View>
      )}
      <AwesomeGallery
        ref={gallery}
        data={params.images.map((uri) => ({ uri }))}
        keyExtractor={(item) => item.uri}
        renderItem={renderItem}
        initialIndex={params.index}
        numToRender={3}
        doubleTapInterval={150}
        onIndexChange={onIndexChange}
        onSwipeToClose={goBack}
        onTap={onTap}
        loop={false}
      />
      {infoVisible && (
        <Animated.View
          entering={mounted ? FadeInDown.duration(250) : undefined}
          exiting={FadeOutDown.duration(250)}
          style={[
            styles.toolbar,
            styles.bottomToolBar,
            {
              height: bottom + 100,
              paddingBottom: bottom,
            },
          ]}
        >
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() =>
                gallery.current?.setIndex(
                  params.index === 0
                    ? params.images.length - 1
                    : params.index - 1
                )
              }
            >
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() =>
                gallery.current?.setIndex(
                  params.index === params.images.length - 1
                    ? 0
                    : params.index + 1,
                  true
                )
              }
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default Photos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
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
