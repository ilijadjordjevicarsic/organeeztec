import { Text, View, TextInput, Pressable } from "react-native";
import { Button } from "@react-native-material/core";
import { login_style } from "../styles/login-style";
import { auth, signIn } from "../firebase_functions";
import { StackActions } from "@react-navigation/native";
import Toast from "react-native-root-toast";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Stack } from "@react-native-material/core";
import { Keyboard } from "react-native";
import { LoadingIndicator } from "./LoadingIndicator";

export const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [pass, setPassword] = useState("");

  const [loggingIn, setLoggingIn] = useState(false);

  return (
    <View style={login_style.container}>
      <Text style={login_style.label}>Email:</Text>

      <TextInput
        autoCapitalize="none"
        defaultValue={email}
        onChangeText={(newEmail) => setEmail(newEmail)}
        style={login_style.input}
        autoCorrect={false}
      ></TextInput>

      <Text style={login_style.label}>Lozinka:</Text>

      <TextInput
        defaultValue={pass}
        onChangeText={(newPass) => setPassword(newPass)}
        secureTextEntry={true}
        style={login_style.input}
        autoCorrect={false}
      ></TextInput>
      {loggingIn ? (
        <LoadingIndicator></LoadingIndicator>
      ) : (
        <>
          <Pressable
            disabled={email === "" || pass === ""}
            title="Login"
            onPress={() => {
              login(email, pass);
            }}
            style={
              email === "" || pass === ""
                ? login_style.disabledBtn
                : login_style.button
            }
            titleStyle={
              email === "" || pass === ""
                ? login_style.disabledText
                : login_style.buttonText
            }
          >
            <Text style={login_style.buttonText}>Login</Text>
          </Pressable>

          <Text
            style={login_style.registerBtn}
            onPress={() => navigation.navigate("Register")}
          >
            Nemaš nalog? Prijavi se!
          </Text>
        </>
      )}
    </View>
  );

  function login(email, password) {
    Keyboard.dismiss();
    setLoggingIn(true);
    if (
      email === undefined ||
      password === undefined ||
      email === null ||
      password === null ||
      email.indexOf("@eestec.rs") != email.length - "@eestec.rs".length
    ) {
      //nije dobar unos
      Toast.show("Uneli ste neispravnu email adresu", {
        duration: Toast.durations.SHORT,
      });

      setLoggingIn(false);
    } else {
      //log in
      signIn(auth, email, password)
        .then((r) => {
          /*let toast = Toast.show("Uspešna prijava", {
            duration: Toast.durations.SHORT,
          });*/
          setLoggingIn(false);
          //navigation.navigate("Main");
        })
        .catch((g) => {
          if (g.code === "auth/user-not-found") {
            Toast.show("Email adresa nije registrovana ni na jedan nalog", {
              duration: Toast.durations.SHORT,
            });

            setLoggingIn(false);
          } else if (g.code === "auth/wrong-password") {
            Toast.show("Pogrešna šifra", {
              duration: Toast.durations.SHORT,
            });

            setLoggingIn(false);
          } else if (g.code === "auth/too-many-requests") {
            Toast.show(
              "Napravili ste previše pokušaja. Pokušajte ponovo kasnije",
              {
                duration: Toast.durations.SHORT,
              }
            );

            setLoggingIn(false);
          } else {
            Toast.show("Došlo je do greške", {
              duration: Toast.durations.SHORT,
            });
            console.log(g.code);

            setLoggingIn(false);
          }
        });
    }
  }
};
