import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { EMOJI_DATA, CategoryTranslation } from "../../../mock/emojiData";
import PressableOpacity from "../../../components/PressableOpacity";

const BLOCK_COUNT = 9;
const EMOJI_WIDTH = Dimensions.get("window").width / BLOCK_COUNT;

const EMOJI_SIZE_PER_BLOCK = [
  { total: 145, height: 824 },
  { total: 291, height: 1555 },
  { total: 121, height: 686 },
  { total: 111, height: 641 },
  { total: 204, height: 1098 },
  { total: 76, height: 458 },
  { total: 217, height: 1189 },
  { total: 207, height: 1098 },
  { total: 268, height: 1418 },
];

const EmojiKeyboard = React.memo(({ onEmoji, keyboardHeight }) => {
  const EmojiItem = React.memo(({ item, index, sendEmoji }) => {
    return (
      <PressableOpacity
        onPress={() => sendEmoji(item.emoji)}
        style={styles.emojiWrapper}
      >
        <Text style={styles.emojiStyle}>{item.emoji}</Text>
      </PressableOpacity>
    );
  });

  const EmojiList = ({ item, index, sendEmoji }) => {
    return (
      <View
        style={{
          height: EMOJI_SIZE_PER_BLOCK[index].height,
          width: Dimensions.get("screen").width,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: "dimgrey",
            fontWeight: "600",
            marginHorizontal: 10,
            marginBottom: 10,
            marginTop: 20,
          }}
        >
          {CategoryTranslation[item.title]}
        </Text>
        <FlashList
          scrollEnabled={false}
          numColumns={BLOCK_COUNT}
          data={item.data}
          estimatedItemSize={EMOJI_SIZE_PER_BLOCK[index].total}
          keyExtractor={(_, i) => `${i}${index}`}
          renderItem={(props) => <EmojiItem {...props} sendEmoji={sendEmoji} />}
        />
      </View>
    );
  };

  return (
    <View>
      <View
        style={{
          height: keyboardHeight,
          width: Dimensions.get("screen").width,
        }}
      >
        <FlashList
          data={EMOJI_DATA}
          keyExtractor={(_, i) => i.toString()}
          estimatedItemSize={9}
          renderItem={(props) => <EmojiList {...props} sendEmoji={onEmoji} />}
        />
      </View>
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
