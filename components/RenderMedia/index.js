import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import PressableOpacity from "../PressableOpacity";

const MAX_WIDTH = Dimensions.get("window").width * 0.8;

const RenderOneImage = ({ uri, onPressImage }) => {
  return (
    <PressableOpacity onPress={() => onPressImage(0)}>
      <Image
        source={{ uri: uri }}
        style={{
          width: MAX_WIDTH * 0.8,
          height: MAX_WIDTH * 0.8,
        }}
      />
    </PressableOpacity>
  );
};

const RenderTwoImage = ({ data, onPressImage }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        width: MAX_WIDTH,
        height: MAX_WIDTH / 2,
        gap: 5,
      }}
    >
      <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(0)}>
        <Image
          source={{ uri: data[0].uri }}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            resizeMode: "cover",
          }}
        />
      </PressableOpacity>
      <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(1)}>
        <Image
          source={{ uri: data[1].uri }}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            resizeMode: "cover",
          }}
        />
      </PressableOpacity>
    </View>
  );
};

const RenderThreeImage = ({ data, onPressImage }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        width: MAX_WIDTH,
        height: MAX_WIDTH,
        gap: 5,
      }}
    >
      <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(0)}>
        <Image
          source={{ uri: data[0].uri }}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            resizeMode: "cover",
          }}
        />
      </PressableOpacity>
      <View style={{ flex: 1, gap: 5 }}>
        <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(1)}>
          <Image
            source={{ uri: data[1].uri }}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              resizeMode: "cover",
            }}
          />
        </PressableOpacity>
        <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(2)}>
          <Image
            source={{ uri: data[2].uri }}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              resizeMode: "cover",
            }}
          />
        </PressableOpacity>
      </View>
    </View>
  );
};

const RenderFourImage = ({ data, onPressImage }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        width: MAX_WIDTH,
        height: MAX_WIDTH,
        gap: 5,
      }}
    >
      <View style={{ flex: 1, gap: 5 }}>
        <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(0)}>
          <Image
            source={{ uri: data[0].uri }}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              resizeMode: "cover",
            }}
          />
        </PressableOpacity>
        <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(1)}>
          <Image
            source={{ uri: data[1].uri }}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              resizeMode: "cover",
            }}
          />
        </PressableOpacity>
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <PressableOpacity style={{ flex: 1 }} onPress={() => onPressImage(2)}>
          <Image
            source={{ uri: data[2].uri }}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              resizeMode: "cover",
            }}
          />
        </PressableOpacity>
        <PressableOpacity
          style={{ flex: 1, position: "relative" }}
          onPress={() => onPressImage(3)}
        >
          {data.length > 4 && (
            <View
              style={{
                position: "absolute",
                zIndex: 1,
                ...StyleSheet.absoluteFill,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
              }}
            >
              <Text style={{ color: "white", fontSize: 70 }}>
                +{data.length - 4}
              </Text>
            </View>
          )}
          <Image
            source={{ uri: data[3].uri }}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              resizeMode: "cover",
            }}
          />
        </PressableOpacity>
      </View>
    </View>
  );
};

const RenderGrid = ({ data, onPressImage }) => {
  if (data.length === 1) {
    return <RenderOneImage onPressImage={onPressImage} uri={data[0].uri} />;
  } else if (data.length === 2) {
    return <RenderTwoImage onPressImage={onPressImage} data={data} />;
  } else if (data.length === 3) {
    return <RenderThreeImage onPressImage={onPressImage} data={data} />;
  } else {
    return <RenderFourImage onPressImage={onPressImage} data={data} />;
  }
};

const RenderMedia = ({ data, onPressImage }) => {
  return (
    <View
      style={{
        margin: 5,
        overflow: "hidden",
        borderRadius: 10,
      }}
    >
      <RenderGrid data={data} onPressImage={onPressImage} />

      {/* {data.map((item, index) => (
        <RenderImage {...{ item, index }} />
      ))} */}
    </View>
  );
};

export default RenderMedia;

const styles = StyleSheet.create({});
