import React from "react";
import { View } from "react-native";
import { Link } from "expo-router";

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Link href="/home">Home</Link>
      <Link href="/chat">Chat</Link>
    </View>
  );
};

export default App;
