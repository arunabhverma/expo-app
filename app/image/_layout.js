import { Slot } from "expo-router";
import { useNavigation } from "expo-router";
import React from "react";

export default function Layout() {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return <Slot />;
}
