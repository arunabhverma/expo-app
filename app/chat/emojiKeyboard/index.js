import React, { useCallback, useLayoutEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  VirtualizedList,
} from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { EMOJI_DATA, CategoryTranslation } from "../../../mock/emojiData";
import PressableOpacity from "../../../components/PressableOpacity";

const BLOCK_COUNT = 9;
const EMOJI_WIDTH = Dimensions.get("window").width / BLOCK_COUNT;

const EmojiKeyboard = ({ onEmoji }) => {
  const getItem = useCallback((_data, index) => _data[index], []);
  const getItemCount = useCallback((_data) => _data?.length, []);

  const keyExtractor = useCallback((item) => item.title, []);
  const keyExtractorEmoji = useCallback((item) => item.name, []);

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

  const renderItem = useCallback(({ item, index }) => {
    return (
      <View>
        <Text style={[styles.heading, index !== 0 && { paddingTop: 15 }]}>
          {CategoryTranslation[item.title]}
        </Text>
        <FlatList
          scrollEnabled={false}
          data={item.data}
          numColumns={9}
          renderItem={renderItemEmoji}
          keyExtractor={keyExtractorEmoji}
          initialNumToRender={1}
          maxToRenderPerBatch={10}
        />
      </View>
    );
  }, []);

  return (
    <ScrollView>
      <VirtualizedList
        scrollEnabled={false}
        data={EMOJI_DATA}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        getItem={getItem}
        getItemCount={getItemCount}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
        windowSize={10}
      />
    </ScrollView>
  );
};

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
