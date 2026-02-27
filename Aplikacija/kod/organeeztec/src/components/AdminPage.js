import { Text, View, TouchableOpacity, Pressable } from "react-native";
import { logOut, auth, db } from "../firebase_functions";
import { admin_style } from "../styles/admin-style";
import { useState } from "react";
import { Button } from "@react-native-material/core";
import { LoadingIndicator } from "./LoadingIndicator";

export const AdminPage = ({ navigation }) => {
  function logout() {
    setLoggintOut(true);
    logOut(auth)
      .then(() => {
        console.log("logged out");
        setLoggintOut(false);
      })
      .catch((g) => {
        console.log(g);
        setLoggintOut(false);
      });
  }
  const handlePress1 = () => {
    navigation.navigate("AdminEvents");
  };
  const handlePress2 = () => {
    navigation.navigate("AdminAuthentification");
  };
  const handlePress3 = () => {
    navigation.navigate("AdminBordAplicant", {
      applications_open: isApplicationsOpen,
    });
  };

  const handlePress5 = () => {
    navigation.navigate("AdminMemberList");
  };

  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [logginOut, setLoggintOut] = useState(false);
  const toggleApplicationsOpen = () => {
    const boardRef = db.collection("board").doc("board");
    const newApplicationsOpen = !isApplicationsOpen;
    boardRef.update({ applications_open: newApplicationsOpen });
    setIsApplicationsOpen(newApplicationsOpen);
  };

  const buttonText = isApplicationsOpen
    ? "Zatvori prijave za bord"
    : "Otvori prijave za bord";

  return (
    <View style={admin_style.container}>
      <Text style={admin_style.title}> Admin Stranica</Text>
      <Pressable
        style={admin_style.button}
        title="Ažuriranje događaja"
        onPress={handlePress1}
      ><Text style={admin_style.buttonText}>Ažuriranje događaja</Text></Pressable>
      <Pressable
        style={admin_style.button}
        title={buttonText}
        onPress={toggleApplicationsOpen}
      ><Text style={admin_style.buttonText}>{buttonText}</Text></Pressable>
      <Pressable
        style={admin_style.button}
        title="Zahtevi za autentifikaciju"
        onPress={handlePress2}
      ><Text style={admin_style.buttonText}>Zahtevi za autentifikaciju</Text></Pressable>
      <Pressable
        style={admin_style.button}
        title="Prijave za upravni odbor"
        onPress={handlePress3}
      ><Text style={admin_style.buttonText}>Prijave za upravni odbor</Text></Pressable>

      <Pressable
        style={admin_style.button}
        title="Spisak članova "
        onPress={handlePress5}
      ><Text style={admin_style.buttonText}>Spisak članova</Text></Pressable>
      {logginOut ? (
        <LoadingIndicator></LoadingIndicator>
      ) : (
        <Pressable
          style={admin_style.button}
          title="Odjavi se"
          onPress={() => logout()}
        ><Text style={admin_style.buttonText}>Odjavi se</Text></Pressable>
      )}
    </View>
  );
};
