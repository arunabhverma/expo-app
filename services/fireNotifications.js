import firestore from "@react-native-firebase/firestore";
import axios from "axios";

const URL = "https://fcm.googleapis.com/fcm/send";
const SERVER_KEY =
  "AAAAgaRQVqk:APA91bHziKRhRl7V40FMA4oNobtZ5-0I_XaJeQTo4MXetWH4G4R3pr136NJCyiu7url8Ei3a1REyUjmbv-yKShxF3JBlKKynY93sQfbSwIdyWw0vARYJdDj2ZFxg9xoieCFiVoEgpbtR";

export const fireNotification = ({ msg, recipient, user_id, image }) => {
  firestore()
    .collection("fcm-tokens")
    .where("user_id", "==", recipient.user_id)
    .get()
    .then((res) => {
      let data = {
        to: res.docs?.[0].data().fcm_token,
        notification: {
          body: msg,
          title: `${recipient.first_name} ${recipient.last_name}`,
          user_id: user_id,
        },
      };
      if (image.length > 0) {
        data.notification.image = image?.[image?.length - 1]?.uri;
      }
      axios
        .post(URL, data, {
          headers: {
            Authorization: `key=${SERVER_KEY}`,
            "Content-Type": "application/json",
          },
        })
        .then((res) => {})
        .catch((e) => console.log("e", e));
    });
};
