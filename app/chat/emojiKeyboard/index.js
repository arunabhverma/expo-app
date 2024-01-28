import React, { useCallback, useLayoutEffect, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text } from "react-native";
import _ from "lodash";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { EMOJI_DATA } from "../../../mock/emojiData";
import PressableOpacity from "../../../components/PressableOpacity";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLOCK_COUNT = 9;
const EMOJI_WIDTH = Dimensions.get("window").width / BLOCK_COUNT;

const EmojiKeyboard = React.memo(({ onEmoji }) => {
  const { bottom } = useSafeAreaInsets();
  const keyExtractorEmoji = useCallback((item) => item.name, []);

  const [state, setState] = useState({
    index: 0,
    data: EMOJI_DATA[0]?.data,
  });

  const renderItemEmoji = useCallback(({ item }) => {
    return (
      <PressableOpacity
        onPress={() => onEmoji(item.emoji)}
        style={styles.emojiButton}
      >
        <Text style={styles.emojiStyle}>{item.emoji}</Text>
      </PressableOpacity>
    );
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <FlatList
        scrollEnabled={false}
        data={state.data}
        extraData={state.index}
        numColumns={9}
        renderItem={renderItemEmoji}
        contentContainerStyle={{ paddingBottom: bottom }}
        keyExtractor={keyExtractorEmoji}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        windowSize={10}
      />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  heading: {
    fontSize: 15,
    fontWeight: "600",
    color: "dimgrey",
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  emojiButton: {
    width: EMOJI_WIDTH,
    height: EMOJI_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiStyle: {
    fontSize: 25,
  },
});

export default EmojiKeyboard;
