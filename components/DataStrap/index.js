import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import Animated, {
  SlideInDown,
  SlideOutDown,
  ZoomIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import PressableOpacity from "../PressableOpacity";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DataStrap = React.forwardRef((props, ref) => {
  const { imageData, onDelete, isVisible, onOpenImage } = props;
  if (!isVisible) {
    return null;
  }
  return (
    <Animated.View
      entering={SlideInDown.duration(500)}
      exiting={SlideOutDown.duration(300)}
      style={styles.container}
    >
      <Animated.FlatList
        ref={ref}
        horizontal
        keyboardShouldPersistTaps={"always"}
        contentContainerStyle={styles.flatListContainerStyle}
        data={imageData}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={ZoomIn}
            key={index.toString()}
            style={styles.imageAnimatedView}
          >
            <AnimatedPressable
              entering={ZoomIn.delay(200)}
              style={styles.imageButton}
              onPress={() => onDelete(index)}
            >
              <Ionicons name="close" size={20} color="white" />
            </AnimatedPressable>
            <PressableOpacity
              onPress={() => onOpenImage(index)}
              style={{ zIndex: -100, overflow: "hidden", borderRadius: 10 }}
            >
              <Image source={{ uri: item.uri }} style={styles.image} />
            </PressableOpacity>
          </Animated.View>
        )}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  flatListContainerStyle: {
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  imageAnimatedView: {
    position: "relative",
    backgroundColor: "rgb(240, 240, 240)",
    borderRadius: 10,
  },
  imageButton: {
    position: "absolute",
    width: 28,
    height: 28,
    backgroundColor: "dimgrey",
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    right: -5,
    top: -10,
  },
  image: {
    width: 80,
    height: 80,
  },
});

export default DataStrap;
