import { Text, View } from "react-native";
import { main_style } from "../styles/main-style";
import { BottomNav } from "./BottomNav";

export const NotificationsPage = ({ navigation }) => {
  return (
    <BottomNav nav={navigation} active="notifications">
      <Text> Notifikacije </Text>
    </BottomNav>
  );
};
