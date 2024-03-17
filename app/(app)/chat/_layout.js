import { Slot, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
  const navigation = useNavigation();
  const { params } = useLocalSearchParams();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${params?.first_name || ""} ${params?.last_name || ""}`,
    });
  }, [navigation]);

  return <Slot />;
}
