import { Redirect, Stack, useNavigation } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function AppLayout() {
  const navigation = useNavigation();
  const { user_id } = useSelector((state) => state.auth);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (user_id === "") {
    return <Redirect href="/login" />;
  }
  return <Stack />;
}
