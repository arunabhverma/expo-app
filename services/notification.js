import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidStyle } from "@notifee/react-native";

export async function onAppBootstrap() {
  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
  return token;
}

export const getPermission = async () => {
  await notifee.requestPermission();
};

export const onMessageReceived = async (message) => {
  let parsedMessage = JSON.parse(JSON.stringify(message));
  onDisplayNotification({
    title: parsedMessage.notification.title,
    body: parsedMessage.notification.body,
    imgURL: parsedMessage.notification?.android?.imageUrl,
  });
  await notifee.incrementBadgeCount();
};

export const onDisplayNotification = async ({ title, body, imgURL }) => {
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    vibration: true,
    vibrationPattern: [300, 500],
    android: {
      vibrationPattern: [300, 500],
    },
  });

  let data = {
    title: title,
    body: body,
    android: {
      channelId,
      pressAction: {
        id: "default",
      },
    },
  };

  if (imgURL) {
    data.android.style = {
      type: AndroidStyle.BIGPICTURE,
      picture: imgURL,
    };
  }
  await notifee.displayNotification(data);
};
