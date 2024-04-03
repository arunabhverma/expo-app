import { Slot } from "expo-router";
import { useNavigation } from "expo-router";
import React from "react";

export default function Layout() {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTintColor: "white",
      headerStyle: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
    });
  }, [navigation]);

  return <Slot />;
}
