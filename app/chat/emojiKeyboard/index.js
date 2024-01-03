import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EMOJI_DATA, CategoryTranslation } from "../../../mock/emojiData";
import PressableOpacity from "../../../components/PressableOpacity";
import { useEffect } from "react";

const EMOJI_WIDTH = Dimensions.get("window").width / 9;
const EMOJI_ROW = 100 / 9;
const EMOJI_ROW_HEIGHT = EMOJI_ROW * EMOJI_WIDTH;
const isAndroid = Platform.OS === "android";

const EmojiKeyboard = React.memo(({ onEmoji }) => {
  const [state, setState] = useState({
    index: 0,
    data: EMOJI_DATA,
  });

  const getItemLayoutTwo = React.useCallback(
    (_, index) => ({
      length: EMOJI_WIDTH,
      offset: EMOJI_WIDTH * Math.ceil(index / 9),
      index,
    }),
    []
  );

  const getItemLayout = React.useCallback((_, index) => {
    return {
      length: EMOJI_ROW_HEIGHT,
      offset: EMOJI_ROW_HEIGHT * index,
      index,
    };
  }, []);

  // useEffect(() => {
  //   updateData();
  // }, []);

  // const updateData = (id = 0) => {
  //   if (id <= EMOJI_DATA?.length) {
  //     setState((prev) => ({
  //       ...prev,
  //       data: [...prev.data, EMOJI_DATA[id]],
  //       index: prev.index + 1,
  //     }));
  //   }
  // };

  // console.log("data", state.index);

  const EmojiItem = React.memo(({ item, index, sendEmoji }) => {
    return (
      <TouchableOpacity
        onPress={() => sendEmoji(item.emoji)}
        style={styles.emojiWrapper}
      >
        <Text style={styles.emojiStyle}>{item.emoji}</Text>
      </TouchableOpacity>
    );
  });

  const EmojiList = React.memo(({ item, index, sendEmoji }) => {
    return (
      <View>
        <Text>{CategoryTranslation[item.title]}</Text>
        <FlatList
          scrollEnabled={false}
          numColumns={9}
          data={item.data}
          keyExtractor={(_, i) => `${i}${index}`}
          renderItem={(props) => <EmojiItem {...props} sendEmoji={sendEmoji} />}
          initialNumToRender={10}
          windowSize={16}
          maxToRenderPerBatch={5}
          getItemLayout={getItemLayoutTwo}
        />
      </View>
    );
  });

  return (
    <View>
      {/* <FlatList
        data={state.data}
        extraData={state.index}
        keyExtractor={(_, i) => i.toString()}
        renderItem={(props) => <EmojiList {...props} sendEmoji={onEmoji} />}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        getItemLayout={getItemLayout}
        removeClippedSubviews={isAndroid}
      /> */}

      <Text>Hello world!</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  emojiWrapper: {
    width: EMOJI_WIDTH,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiStyle: {
    fontSize: 25,
  },
});

export default EmojiKeyboard;
