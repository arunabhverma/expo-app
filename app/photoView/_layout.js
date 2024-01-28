import { Slot } from "expo-router";
import { useNavigation } from "expo-router";
import React from "react";

export default function Layout() {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      //   headerShown: true,
      headerTransparent: true,
      headerTintColor: "white",
      // statusBarStyle: "light",
      // statusBarTranslucent: false,
      // headerBackground: "red",

      // headerTintColor: "white",
      headerStyle: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      statusBarStyle: "white",
      statusBarColor: "black",
    });
  }, [navigation]);

  return <Slot />;
}
