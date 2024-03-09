import { Slot } from "expo-router";
import { useNavigation } from "expo-router";
import React from "react";

export default function Layout() {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      headerTranslucent: true,
      headerStyle: {
        backgroundColor: "transparent",
        blurEffect: "systemUltraThinMaterialDark",
      },
      headerLargeStyle: {
        backgroundColor: "transparent",
      },
      headerLargeTitle: true,
    });
  }, [navigation]);

  return <Slot />;
}
