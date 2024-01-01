import React from "react";
import { Button, FlatList, Pressable, Text, View } from "react-native";
import EMOJI_DATA from "../../../mock/emojiData";

const EmojiKeyboard = ({ onEmoji }) => {
  return (
    <View>
      {/* <Text>Hello world1</Text> */}
      {/* <FlatList
        data={EMOJI_DATA}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => {
          return (
            <View>
              <Text>{item.title}</Text>
              <FlatList
                data={item.data}
                keyExtractor={(_, i) => i.toString()}
                renderItem={(val, id) => {
                  return (
                    <View>
                      <Text>{val.emoji}</Text>
                    </View>
                  );
                }}
              />
            </View>
          );
        }}
      /> */}
      {/* <Pressable
        android_ripple={{
          color: "rgba(0, 0, 0, 0.1)",
          borderless: false,
        }}
        onPress={() => onEmoji("🥰")}
      >
        <Text>🥰</Text>
      </Pressable> */}
    </View>
  );
};

export default EmojiKeyboard;
