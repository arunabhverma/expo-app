import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useKeyboard = () => {
  // const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    function onKeyboardDidShow(e) {
      setIsKeyboardOpen({ open: true, ...e });
    }

    function onKeyboardDidHide(e) {
      setIsKeyboardOpen({ open: false, ...e });
    }

    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardDidHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardOpen;
};
