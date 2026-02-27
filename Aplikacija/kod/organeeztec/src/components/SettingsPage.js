import { Text, View, TouchableOpacity } from "react-native";
import { Button } from "@react-native-material/core";
import { Avatar } from "@react-native-material/core";
import { settings_style } from "../styles/settings-style";
import { logOut, auth } from "../firebase_functions";
import { useNavigation, CommonActions } from "@react-navigation/native";

export const SettingsPage = ({ navigation }) => {
  const handlePress = () => {
    navigation.navigate("MyProfile");
  };

  return (
    <View style={settings_style.container}>
      <TouchableOpacity onPress={handlePress}>
        <View style={settings_style.avatar}>
          <Text style={settings_style.text}>Moj profil</Text>
        </View>
      </TouchableOpacity>
      <Button
        style={settings_style.button}
        title="My Tasks"
        onPress={() => tasks()}
      />
    </View>
  );

  function tasks() {
    navigation.navigate("MyTasks");
  }
};
